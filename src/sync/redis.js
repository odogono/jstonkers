var redis = require("redis");
var Entity = require('../entity/entity');

exports.info = 'redis based sync';


var RedisStorage = function(options) {
    this.options = options || {};
    this.client = redis.createClient();

    this.client.on("error", function (err) {
        log("Error " + err);
    });
};

_.extend( RedisStorage.prototype, {

    createEntity:function(entity,options,callback){

    },

    //
    // The entity is assumed to be ready to save (JSON exported)
    saveEntity: function( redisHandle, entity, options, callback ){
        options || (options={});
        var multi = redisHandle,
            i, len, date, status, collection, serialised,
            self = this, 
            keyPrefix = self.options.key_prefix,
            initiateMulti = redisHandle instanceof redis.RedisClient,
            key,keys,val;

        // if(options.debug) log('saving entity ' );
        // if(options.debug) print_var( entity );

        if( !entity.id ){
            // get a new id for the entity
            exports.generateUuid(function(err,id){
                if( err ) throw err;
                entity.id = id; //entity.type + '.' + id;
                entity._uuidgen = true;
                // log('saving changed entity ' + entity.id);
                // call ourselves again
                self.saveEntity( redisHandle, entity, options, callback );
            });
            // log('proceeding');
            return;
        }

        if( initiateMulti ) { //redisHandle instanceof redis.RedisClient ){

            multi = redisHandle.multi();
        } else {
            // log('not initiating multi for saveEntity');
            // print_ins( redisHandle.queue );
        }

        // update the date
        entity.updated_at = new Date();

        serialised = entity.toJSON({relationsAsId:true,relations:false,debug:options.debug});
        serialised.type = entity.type;
        if( options.debug ) log( 'saving serialised: ' + JSON.stringify( serialised ) );

        key = keyPrefix + ':' + entity.id;
        var entityHashFields = Common.config.sync.redis.entity_hset;

        // convert date fields to times (for sorting purposes)
        /*if( entity.created_at ){
            multi.hmset( key, 'created_at', new Date(entity.created_at).getTime() );
        }

        if( entity.updated_at ){
            multi.hmset( key, 'updated_at', new Date(entity.updated_at).getTime() );
        }//*/

        // add entity fields to entity hash
        _.each( entityHashFields, function(field){
            if( entity[field] )
                multi.hmset( key, field, entity[field] );
        });


        // if the entity has specific keys it wants as fields, then apply so now
        // log("WAAAH " + entity.storeKeys() );
        if( entity.storeKeys ){
            keys = entity.storeKeys();
            for( i=0,len=keys.length;i<len;i++ ){
                if( (val = serialised[keys[i]]) || (val = entity[keys[i]]) ){
                    if( _.isDate(val) )
                        val = val.getTime();
                    multi.hmset( key, keys[i], val );
                }
            }
        }

        multi.hmset(key, 'value', JSON.stringify(serialised) ); //JSON.stringify(value) );

        // entity status index
        status = entity.get('status');

        for( i in Common.Status ){
            // status = entity.get('status') || entity.status;
            if( status === Common.Status[i] )
                multi.sadd( keyPrefix + ':status:' + Common.Status[i], entity.id );
            else
                multi.srem( keyPrefix + ':status:' + Common.Status[i], entity.id );
            // log(entity.id + ' ' + Common.Status[i] );
        }

        // NOTE : logically deleting something does not remove from type and collection sets
        // - retrieving usually 
        // if( status === Common.Status.LOGICALLY_DELETED ){
        //     multi.srem( keyPrefix + ':' + entity.type, entity.id );
        //     if( entity.entityCollection ){
        //         if( options.debug ) log('removing from entityCollection set');
        //         multi.srem( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
        //     }
        // } else {
            // add to entity type set
            multi.sadd( keyPrefix + ':' + entity.type, entity.id );
            if( (collection = entity.entityCollection) ){
                // if( options.debug ) log('adding to entityCollection set ' + entity.id);
                // if( options.debug ) print_ins( entity );
                // multi.sadd( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
                multi.sadd( keyPrefix + ':' + collection.getStoreId() + ':' + collection.getName() || 'items', entity.id );
            }
        // }


        // if( options.collectionSetKey )
            // multi.sadd( options.collectionSetKey, entity.id );

        if( initiateMulti ) {//redisHandle instanceof redis.RedisClient ){
            // if( options.debug ) log('ok done!');
            // log( multi.exec );
            // multi.sadd( keyPrefix + ':poobum', 'bingo');
            multi.exec( function(err, replies){
                callback( err, entity );
            });
            // if( options.debug ) log('ok done!');
        } else {
            // log('well no');
        }

        if( callback ){
            callback( null, entity );
        }
    },


    deleteEntity: function( redisHandle, entity ){

    },
});

_.extend( RedisStorage.prototype, {
    

    createCollection: function(collection, options, callback){
        var self = this,
            key, i;

        var multi = self.client.multi();
        // flatten the collection and any contained models
        var cidToModel = collection.flatten();
        
        Step(
            function saveCollection(){
                self.saveEntity( multi, collection, options, this );
            },
            function(){
                var group = this.group();
                for( i in cidToModel ){
                    entity = cidToModel[i];
                    if( entity !== collection )
                        self.saveEntity( multi, entity, options, group() );
                }
            },
            function(err, result){
                if( err ) throw err;
                multi.exec( this );
            },
            function(err,replies){
                callback(err, collection);
            }
        );
    },

    

    retrieveCollectionById: function(collection,options,callback){
        var self = this, result, multi = self.client.multi();
        var collectionKey = options.key_prefix + ':' + collection.id;

        // get the total number of items in the collection
        multi.scard( collectionKey + ':items' );// + collection.get('name') );
        // log( key + ':' + model.getItemsName() );
        multi.get( collectionKey );
        multi.exec( function(err, replies){
            // print_ins( arguments );
            if( replies ){
                result = JSON.parse( replies[1] );
                result.item_count = replies[0];
            }
            callback( err, result );
        });
    },

    executeSort: function( client, key, sortField, value, options, callback ){
        var query = [];
        options || (options={});
        var sortAlpha = false;
        var sortDesc = false;
        if( sortField ){
            sortAlpha = true;
            sortField = options.key_prefix + ':*->' + sortField;
        }
        else
            sortField = "nosort";

        query.push( key );
        query.push( 'BY' );
        query.push(sortField);
        if( value ){
            query.push('GET' );
            query.push( value );
        }
        if( options.sortBy )
            query.push( sortBy );

        if( options.offset !== undefined && options.limit !== undefined && options.limit >= 0 ){
            query.push( 'LIMIT');
            query.push( options.offset );
            query.push( options.limit );
        }

        if( sortAlpha )
            query.push('ALPHA');
        if( sortDesc )
            query.push('DESC');

        // log( query.join(' ') );
        if( callback )
            query.push( callback );


        client.sort.apply( client, query );
    },


    // 
    // Retrieves all the entities in a given redis set name
    // 
    retrieveCollectionBySet: function( setKey, collection, options, callback){
        var self = this, result = {}, multi = self.client.multi();
        var sortBy = options.sort || null;

        if( collection ){
            options || (options={});
            if( Entity.isEntity(collection) ){
                options.offset = collection.get('offset');
                options.limit = collection.get('page_size');    
            } else {
                options.offset = collection.offset;
                options.limit = collection.page_size;
            }
        }

        multi.scard(setKey);

        self.executeSort( multi, setKey, sortBy, options.key_prefix + ':*->value', options );

        multi.exec( function(err, replies){
            if( replies ){
                result.item_count = replies[0];
                result.items = _.map( replies[1], function(r){ return JSON.parse(r); });
            }
            callback( err, result, options );
        });
    },

    //
    //
    //
    retrieveCollectionByType: function(collection,options,callback){
        var self = this,
            multi,
            query = [], 
            result = {},
            diffKey = options.key_prefix + ':diff',
            valueKey = options.key_prefix + ':*->value',
            collectionKey, // = options.key_prefix + ':' + collection.entityType,
            collectionEntityId = collection.get('entity'),
            collectionName = collection.get('name');

        if( collectionEntityId && collectionName ){
            collectionKey = [options.key_prefix, collection.get('entity'), collection.get('name')].join(':');
        } else
            collectionKey = [options.key_prefix, collection.entityType].join(':');


        // log('retrieving coll with set ' + collectionKey );
        // log('but could be using ' + collection.get('entity') + ':' + collection.get('name') );
        if( options.find ){
            // log( 'finding with ' + JSON.stringify(options.find) );


            if( options.find.id ){
                collectionKey = options.key_prefix + ':' + options.find.id;

                this.client.hget( collectionKey, 'value', function(err, ent){
                    result = { items:[ JSON.parse(ent) ], item_count:1 };
                    // print_ins( result );
                    callback( err, result );
                });
                return;
            }
            else {
                multi = self.client.multi();
                _.each( options.find, function(val,key){

                    if( key === 'status' ){
                        if( _.isObject(val) && val.$ne ){
                            // log('ne ' + val.$ne );

                            var statusKey = options.key_prefix + ':status:' + val.$ne;
                            // compute a diff set between all of the entities and the ones with the given status
                            multi.sdiffstore( diffKey, collectionKey, statusKey );
                            multi.scard(diffKey);

                            // retrieve values back for the entities
                            self.executeSort( multi, 
                                            diffKey, 
                                            null, 
                                            valueKey, 
                                            { offset:collection.get('offset'), limit:collection.get('limit')} );

                            // self.retrieveCollectionBySet( diffKey, options, callback  );

                            // query.push( diffKey );
                            // query.push( 'BY' );
                            // query.push('nosort');
                            // query.push('GET' );
                            // query.push( valueKey );
                            // query.push( 'ALPHA' );
                            // query.push( 'LIMIT');
                            // query.push( 0 );
                            // query.push( 10 );

                            // multi.sort.apply( multi, query );

                            multi.exec( function(err, replies){
                                if( replies ){
                                    result.item_count = replies[1];
                                    // result.items = replies[2];
                                    result.items = _.map( replies[2], function(r){ return JSON.parse(r); });
                                }
                                callback( err, result );
                            });

                            return;
                        }
                    }//*/
                    

                });

            }
        }

        // log('rcbs ' + JSON.stringify(collection) );
        // do a straight retrieval of all entities
        this.retrieveCollectionBySet( collectionKey, collection, options, callback  );
    },
});

_.extend( RedisStorage.prototype, {
    delete: function(model,options,callback){
        var i, j, entity, self = this;
        var keyPrefix = self.options.key_prefix;
        var entityDetails = Common.entity.ids[model.type];
        var flattenOptions = {toJSON:false,recurse:false};
        // var factoryOptions = {toJSON:true,exportAsMap:false};
        if( options.destroyRelated ) {
            flattenOptions.recurse = true;
        }
        // setting this flag to true will only destroy entities that are marked (using 'own')
        // as belonging to the refering entity
        flattenOptions.ownOnly = _.isUndefined(options.ownOnly) ? true : options.ownOnly;

        var cidToModel = _.values( model.flatten(flattenOptions) );
        // print_ins( cidToModel );
        // var cidToModel = Common.entity.Factory.toJSON( model, factoryOptions );

        if( options.destroyHard ){

            // delete each model from the db
            var multi = self.client.multi();

            // print_var( cidToModel );

            for( i in cidToModel ){
                entity = cidToModel[i];

                // delete the values hash
                multi.del( keyPrefix + ':' + entity.id );

                // delete from the type set
                multi.srem( keyPrefix + ':' + entity.type, entity.id );

                // delete from the status set for this model
                for( j in Common.Status ){
                    multi.srem( keyPrefix + ':status:' + Common.Status[j], entity.id );
                }

                // log('the entity doesnt have its entityCollection set!' );
                // log('hard deleting ' + entity.id );
                // print_ins( entity );
                if( entity.entityCollection ){
                    
                    multi.srem( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
                }
            }

            multi.exec( function(err, replies){
                callback( err, entity );
            });

            return model;
        }

        // if( options.debug ){
            // print_ins( cidToModel );
            // print_ins( _.values( model.flatten({toJSON:true}) ) );
        // }

        // a normal delete is actually setting the status of each model to logically deleted
        for( i in cidToModel ){
            cidToModel[i].set( 'status', Common.Status.LOGICALLY_DELETED );
        }


        Step(
            function(){
                var group = this.group();
                options.debug = true;
                for( i in cidToModel ){
                    self.saveEntity( self.client, cidToModel[i], options, group() );
                }
            },
            function(err,result){
                callback(err,model);
            }
        );

        return model;
    }
});

_.extend( RedisStorage.prototype, {

    // Update a model by replacing its copy in `this.data`.
    update: function(model, options, callback) {
        var self = this,i;
        var keyPrefix = self.options.key_prefix;
        var entityDetails = Common.entity.ids[model.type];        
        var collectionSetKey;
        var cidToModel,entity;


        var multi = self.client.multi();
        // flatten the collection and any contained models
        var cidToModel = model.flatten();

        // log('redis.update with ' + JSON.stringify(options) );
        // if( options.debug ) print_var( cidToModel );
        
        Step(
            function ensureIds(){
                var group = this.group();
                for( i in cidToModel ){
                    entity = cidToModel[i];
                    if( entity.isNew() ){
                        exports.generateUuid({entity:entity}, group() );
                    }
                }
            },
            function saveEntities(){
                var group = this.group();
                for( i in cidToModel ){
                    entity = cidToModel[i];
                    self.saveEntity( multi, entity, options, group() );
                    // log('saved entity ' + i );
                }
            },
            function executeStatements(err, result){
                if( err ) throw err;
                multi.exec( this );
            },
            function(err,replies){
                callback(err, model);
            }
        );//*/
        /*


        var assignIdToEntity = function(entity, callback){
            exports.generateUuid( function(err,id){
                entity.id = id; //entity.type + '.' + id;
                callback(null,entity);
            });
        };

        // save each of the models first - this is to ensure they have a valid id
        Step(
            function(){
                // A build a map of model cids to models, so that we can later update ids if need be
                var factoryOptions = {toJSON:false,exportAsMap:true};
                if( options.saveRelated ) factoryOptions.exportRelations = true;
                cidToModel = Common.entity.Factory.toJSON( model, factoryOptions );

                // check the models have ids, if not then generate some for them
                var group = this.group();

                _.each( cidToModel, function(ent){
                    if( ent.isNew() ){
                        assignIdToEntity(ent,group());
                    }
                });
                // 
            },
            function saveEntities(){
                // print_ins(cidToModel,false,3);
                // referenceChildren means that the parents will have references to children
                var jsonOutput = Common.entity.Factory.toJSON( cidToModel, {referenceItems:false,special:true} );

                // print_var(jsonOutput);
                var group = this.group();
                _.each( jsonOutput, function(ent){
                    self.saveEntity( self.client, ent, options, group() );
                });
            },
            function saveEntityERs(err,replies){
                // check for updated ids from the save operation
                // _.each( replies, function(ent){
                    // B set the id on the original models if required
                // });

                // log('saveEntityERs saveEntity multi ');
                // print_var(replies);
                var multi = self.client.multi();
                // one to many relationships will be stored in a set
                _.each( entityDetails.ER, function(er){
                    if( er.oneToMany ){
                        var key = er.name || er.oneToMany;
                        key = key.toLowerCase();

                        collectionSetKey = [keyPrefix,model.id,key].join(':');
                        model[key].each( function(child){
                            multi.sadd( collectionSetKey, child.id );
                        });
                    }
                });

                multi.exec(this);
            },
            function(err,replies){
                // print_ins(model.test_b.at(0).id);
                // process.exit();
                callback(err,model);
            }
        );//*/

        return model;
    },

    retrieveEntitiesById: function( entityIdList, options, callback ){
        var self = this;
        Step(
            function(){
                var group = this.group();
                for( var i=0;i<entityIdList.length;i++ ){
                    // log('retrieveEntitiesById ' + JSON.stringify(entityIdList[i]) );
                    self.retrieveEntityById( entityIdList[i], options, group() );
                }
            },
            function(err, results){
                callback( err, results );
            }
        );
    },

    retrieveEntityById: function( entity, options, callback ){
        var self = this, i, er, name, type, key, targetId;
        var entityId = _.isObject(entity) ? entity.id : entity;
        var entityKey = options.key_prefix + ':' + entityId;
        var ldlKey = options.key_prefix + ":status:" + Common.Status.LOGICALLY_DELETED;
        var entityDef;// = Common.entity.ids[entity.type];
        // var result = options.result;

        if(options.debug) log('retrieveEntityById ' + entityId + ' ' + entityKey + ' fetchRelated ' + options.fetchRelated);

        // retrieve the entity
        this.client.hget( entityKey, 'value', function(err, data){
            if( !data ){
                callback(entityId + ' not found');
                return;
            }
            var entityAttr = JSON.parse(data);
            entityAttr.id = entityId;

            type = entityAttr.type || (_.isObject(entity) ? entity.type : null);
            // delete entityAttr.type;
            entityDef = Common.entity.ids[type];

            if( !options.fetchRelated ){
                callback( null, entityAttr );
                return;
            }

            if(options.debug ) log('hmm plinkyplonk ' + JSON.stringify(entityDef) );
            
            // look for other relations that we should retrieve
            // if there are any collections associated with this entity then fetch their details
            if( entityDef.oneToMany ){
                // this is a collection - look for members
                // log('looking for members of ' + entityKey + ':items' );
                options.fetchSetList.push( {key:entityKey + ':items', callback:function(result){
                    entityAttr.items = result;
                }});

                /*self.client.sdiff( entityKey + ':items', ldlKey, function(err,result){
                    if( err ) throw err;

                    // add the member IDs to the list of entities that should also be retrieved
                    if( options.fetchList ){
                        for( i in result ){
                            // only add to list to be fetched if we haven't already seen it
                            if( result[i] && !options.result[result[i]] ){
                                if( options.debug ) log('1 add ' + result[i] + ' to fetchList' );
                                options.fetchList.push( result[i] );
                            }
                        }
                    }

                    entityAttr.items = result;

                    // log('set members: ' + JSON.stringify(options.fetchList));
                    callback( null, entityAttr );
                });
                return;//*/
            }
            else if( entityDef.ER ){
                for( i in entityDef.ER ){
                    er = entityDef.ER[i];
                    if( er.oneToMany ){
                        name = (er.name || er.oneToMany).toLowerCase();
                        targetId = entityAttr[name];
                        // key = entityKey + ':' + name;
                        // if(options.debug ) log('err ' + name )
                        if( targetId ){
                            if( (options.fetchRelated || options._depth < options.depth) && !options.result[targetId] ){
                                // erCollections.push( name );
                                if( options.debug ) log('2 adding ' + name + ' ' + targetId );
                                options.fetchList.push( targetId );
                            }
                        } else {
                            // look for set members
                            // options.fetchSetList.push( entityKey + ':' + name );
                            options.fetchSetList.push( {key:entityKey + ':' + name, callback:function(result){
                                entityAttr[name] = result;
                            }});

                            /*self.client.sdiff( entityKey + ':' + name, ldlKey, function(err,result){
                                if( options.debug ) log('o2m set ' + JSON.stringify(result) );
                                // add the member IDs to the list of entities that should also be retrieved
                                if( options.fetchList ){
                                    for( i in result ){
                                        // only add to list to be fetched if we haven't already seen it
                                        if( result[i] && !options.result[result[i]] ){
                                            if( options.debug ) log('1 add ' + result[i] + ' to fetchList' );
                                            options.fetchList.push( result[i] );
                                        } // else
                                        // log('bah')
                                    }
                                }
                            });//*/
                        }
                    }
                    else if( er.oneToOne ){
                        name = (er.name || er.oneToOne).toLowerCase();
                        targetId = entityAttr[name];
                        // key = entityKey + ':' + name;
                        // log('considering ' + o2oName  + ' type ' + er.oneToOne );
                        if( targetId && (options.fetchRelated || options._depth < options.depth) && !options.result[targetId] ){
                            // erEntities.push( { key:name, type:er.oneToOne} );
                            if( options.debug ) log('3 add ' + targetId + ' to fetchList' );
                            options.fetchList.push( targetId );
                        }
                    }
                }
            }

            callback( null, entityAttr );
        });
    },

    /**
    *
    */
    /*retrieveEntityByIdOld: function( entity, options, callback ){
        var i,j,self = this,
            itemCounts = [],
            erCollections = [],
            erEntities = [],
            result, items,
            retrievedEntity,
            subOptions,
            er,
            retrieveERCounts = true;
        var entityKey = options.key_prefix + ':' + entity.id;
        var entityDef = Common.entity.ids[entity.type];
        var multi = self.client.multi();
        result = options.result || {};

        if(options.debug) log('retrieveEntityById ' + entity.id );

        if( result[entity.id] ){
            log('retrieveEntityById : already retrieved ' + entity.id );
            callback( err, result );
            return;
        }

        // retrieve the entity
        multi.hget( entityKey, 'value' );

        // if there are any collections associated with this entity then fetch their details
        if( entityDef.ER ){
            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                if( er.oneToMany ){
                    var o2mName = (er.name || er.oneToMany).toLowerCase();
                    var o2mKey = entityKey + ':' + o2mName;
                    // multi.scard( o2mKey );
                    // itemCounts.push( o2mName );
                    if( options.fetchRelated || options._depth < options.depth ){
                        erCollections.push( o2mName );
                    }
                }
                else if( er.oneToOne ){
                    var o2oName = (er.name || er.oneToOne).toLowerCase();
                    var o2oKey = entityKey + ':' + o2oName;
                    // log('considering ' + o2oName  + ' type ' + er.oneToOne );
                    if( options.fetchRelated || options._depth < options.depth ){
                        erEntities.push( { key:o2oName, type:er.oneToOne} );
                    }
                }
            }//);
        }

        multi.exec( function(err, replies){
            if( err ) throw err;
            if( !replies ) callback( err, entity );
            // first result will be the entity value itself
            if( replies[0] ){
                retrievedEntity = JSON.parse(replies[0]);

                // determine whether the status is valid for the criteria supplied
                if( !options.ignoreStatus && retrievedEntity.status === Common.Status.LOGICALLY_DELETED ){
                    // log('failed status check');
                    // log(entity.id + ' not found because of ' + retrievedEntity.status );
                    callback(entity.id + ' not found');
                    return;
                }

                // if( options.ignoreStatus ){
                //     log('ignoring status for ' + replies[0] );
                //     print_ins( retrievedEntity );
                // }
                result[ entity.id ] = retrievedEntity;
            }
            else{
                // error!
                callback(entity.id + ' not found');
                return;
            }

            subOptions = _.extend(options,{result:result,_depth:options._depth+1});

            // if( options.debug ) log('retrieving assocated entities ' + JSON.stringify(erCollections) );
            if( erCollections.length > 0 || erEntities.length > 0 ){
                
                Step(
                    function processEntities(){
                        // assign ids to the entities we are retrieving
                        if( erEntities.length > 0 ){
                            for( i=0;i<erEntities.length;i++ ){
                                erEntities[i].id = retrievedEntity[erEntities[i].key];
                            }
                            // retrieve referenced entities in a single step
                            self.retrieveEntitiesById( erEntities, subOptions, this );
                        }
                        else
                            this();
                    },
                    function processEntityCollections(err, entities){
                        if( err ) callback(err);
                        
                        var group = this.group();
                        for( i=0;i<erCollections.length;i++ ){
                            // log('retrieving collection ' + entityKey +':' + erCollections[i] );
                            self.retrieveCollectionBySet( entityKey +':' + erCollections[i], null, subOptions, group() );
                        }
                    },
                    function assignEntityCollections(err,entities){
                        // TODO : hairy... refactor
                        if( entities ){
                            for( i=0;i<erCollections.length;i++ ){
                                items = entities[i].items;
                                if( items ){
                                    retrievedEntity[erCollections[i]] = retrievedEntity[erCollections[i]] || {items:[]};
                                    for( j=0;j<items.length;j++ ){
                                        result[ items[j].id ] = items[j];
                                        retrievedEntity[erCollections[i]].items.push( items[j].id );
                                    }
                                }
                            }
                        }
                        // print_ins( result, false, 3 );
                        callback(err,result);
                    }
                );
            }
            else{
                callback( err, result );    
            }
        });
    },//*/


    
    // Retrieve a model from `this.data` by id.
    find: function(model, options, callback) {
        var i, self = this,
            item, entityId,
            collectionSetKey,
            result;
        var entityDetails = Common.entity.ids[model.type];
        
        var retrieveChildren = [];
        var itemCounts = [];
        var modelKey = [self.options.key_prefix, model.id].join(':');

        options._depth = options._depth || 1;
        options.fetchList = [ model.id ];
        options.fetchSetList = [];
        options.result = {};

        /*
        if( model instanceof Common.entity.EntityCollection ){
            if( !model.id ){
                this.retrieveCollectionByType( model, options, callback );
            }
            else{
                this.retrieveCollectionById( model,options,callback);
            }
        }
        else {
            self.retrieveEntityById( model, options, callback );
        }//*/

        var evalFetchList = function(){
            if( options.fetchSetList.length > 0 ){
                item = options.fetchSetList.shift();
                if( _.isObject(item){
                    self.client.sdiff( entityKey + ':items', ldlKey, function(err,result){
                        if( err ) throw err;

                        if( item.callback ){
                            item.callback( result );
                        }
                    });
                });
            } else if( options.fetchList.length > 0 ) {
                // pull the next
                entityId = options.fetchList.shift();
                if( options.debug ) log('going for retrieve of ' + entityId );
                self.retrieveEntityById( entityId, options, function(err,data){
                    if( err ){
                        // TODO : will it always matter that a model cant be found?
                        callback( err );
                        return;
                    }
                    // store result
                    options.result[ entityId ] = data;
                    // re-check if we need to fetch anything
                    evalFetchList();
                });
            } else {
                if( options.debug ) log('finished fetchList retrieve');
                callback( null, options.result );
            }
        };

        evalFetchList();

        // this.retrieveEntityById( model, options, function(err,data){
        //     log( 'fetchList is now ' + JSON.stringify(options.fetchList) );
        //     callback( err, data );
        // });
    }
     
});

var store = new RedisStorage(Common.config.sync.redis);
// var fwdCount = 0;

exports.sync = function(method, model, options) {
    var config = _.extend( _.clone(Common.config.sync.redis), options );
    var concluded = false;
    var resp, modelID;

    function forwardResult( err, result ){
        // fwdCount++;
        if( err ){
            // log('fwd err ' + err );
            // print_ins(arguments);
            // log( options.error );
            if( options.error )
                options.error(err);
            else
                throw err;
            return;
        }
        if( options.success ){
            // log('fwdResult done');
            // print_ins(arguments);
            // log( options.success );
            // if( Common.debug ) {
            //     log( fwdCount + ' success here ' + model.cid + ' ' + JSON.stringify(result) );
            //     print_ins(arguments);
            //     print_stack();
            // }
            options.success(result);
        }
    };

    if( options.debug )  log('sync with ' + method );

    switch( method ){
        case 'read':
            concluded = true;
            store.find( model, config, forwardResult );
            return;
        case 'create':
            // if( model instanceof Common.entity.EntityCollection ){
                // concluded = true;
                // store.createCollection( model, config, forwardResult );
            // } else {
                concluded = true;
                store.update( model, config, forwardResult );
            // }
            break;
        case 'update':
            concluded = true;
            store.update( model, config, forwardResult );
            break;
        case 'delete':
            concluded = true;
            store.delete( model, config, forwardResult );
            // log('uh deleting?');
            break;
    }

    if( !concluded ){
        if (resp) {
            options.success(resp);
        } else {
            options.error('Record not found');
        }
    }

    return model;
}

exports.generateUuid = function( options, callback ){
    var config = Common.config.sync.redis;
    var prefix = config.key_prefix;
    var key = prefix + ':' + config.uuid.key;

    if( _.isFunction(options) && _.isUndefined(callback) ){
        callback = options;
        options = {};
    }

    // store.client.incr( key, callback );
    store.client.incr( key, function(err,id){
        if( options.entity ){
            options.entity.id = id;
            options.entity._uuidgen = true;
        }
        callback(err,id,options);
    });
}

exports.keys = function( callback ){
    store.client.keys( '*', function(err,result){
        callback( err, result );
    });
}

exports.count = function( options, callback ){
    if( _.isUndefined(callback) ){
        callback = options;
        options = {};
    }
    store.client.info( function(err, res){

        var self = this, obj = {}, lines, retry_time;

        if (err) {
            callback( "Ready check failed: " + err.message );
            return;
        }

        lines = res.toString().split("\r\n");

        lines.forEach(function (line) {
            var parts = line.split(':');
            if (parts[1]) {
                obj[parts[0]] = parts[1];
            }
        });

        // counts = [];
        if( obj.db0 ){
            var matches = obj.db0.match(/keys=(\d+)/)
            // var parts = obj.db0.split(',');
            callback( null, parseInt( matches[1], 10 ) );
            return;
        }

        callback( err, obj );
    });
}

exports.clear = function( callback ){
    var config = Common.config.sync.redis;
    var prefix = config.key_prefix;

    // NOTE - in future, use a set of the keys to delete
    
    Step(
        function(){
            store.client.keys( prefix + '*', this );        
        },
        function(err,keys){
            var group = this.group();
            _.each( keys, function(key){
                store.client.del(key, group() );
            });
        },
        function(){
            callback(null);
        }
    );
};
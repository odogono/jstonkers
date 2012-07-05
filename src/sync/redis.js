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
            key,keys,storeKey,storeId,isUnique,val;

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
        delete serialised.id;
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
                storeKey = keys[i];
                isUnique = false;
                if( _.isObject(storeKey) ){
                    isUnique = storeKey.unique;
                    storeKey = storeKey.key;
                }
                if( (val = serialised[storeKey]) || (val = entity[storeKey]) ){
                    if( _.isDate(val) )
                        val = val.getTime();
                    multi.hmset( key, storeKey, val );
                    if( isUnique )
                        multi.set( keyPrefix + ':' + storeKey + ':' + val, entity.id );
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
        // if( options.debug && entity.id === 'foxtrot_2' ) print_ins( entity );//log('well heck ' + entity.entityCollection);

            multi.sadd( keyPrefix + ':' + entity.type, entity.id );
            if( (collection = entity.entityCollection) && (storeId = collection.getStoreId()) ){
                if( options.debug ) log('adding to entityCollection set ' + entity.id);
                // if( options.debug ) print_ins( entity );
                // multi.sadd( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
                multi.sadd( keyPrefix + ':' + storeId + ':' + collection.getName() || 'items', entity.id );
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
        var i, j, entity, collection, ers, self = this;
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

        var cidToModel = _.values( model.flatten(flattenOptions) ).reverse();
        // if( options.debug ) print_var( cidToModel );
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

                // if the entity belongs to an entity collection, then remove it from its set
                if( (collection = entity.entityCollection) ){
                    
                    // multi.srem( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
                    multi.srem( keyPrefix + ':' + collection.getStoreId() + ':' + collection.getName() || 'items', entity.id );
                }

                // remove sets associated
                ers = entity.getOneToMany();
                if( ers ){
                    for( j in ers ){
                        multi.del( keyPrefix + ':' + entity.id + ':' + j );
                    }
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
                // options.debug = true;
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
        // if( options.debug ) process.exit();
        
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
                if( options.debug ) log('entity id is now ' + model.id + '(' + model.cid + ')');
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


    retrieveEntityByQuery: function( query, options, callback ){
        var self=this,key;// = options.key_prefix + ':' + entityId;
        var ldlKey = options.key_prefix + ":status:" + Common.Status.LOGICALLY_DELETED;
        var ignoreStatus = _.isUndefined(options.ignoreStatus) ? false : options.ignoreStatus;

        // build the query into a redis key
        for( var param in query ){
            key = [ options.key_prefix, param, query[param] ].join(':')
        }

        self.client.get( key, function(err,result){
            if( err ) throw err;

            self.client.sismember( ldlKey, result, function(err,isLogicallyDeleted){

                if( (!ignoreStatus && isLogicallyDeleted) || isLogicallyDeleted ){
                    // callback(entityId + ' not found');
                    // TODO : decide what behaviour should be
                    callback();
                    return;
                }
                if( result )
                    options.fetchList.push( result );
                callback(null, result);
            }); 
        });
    },

    // 
    // deprecated?
    // 
    retrieveEntitiesById: function( entityIdList, options, callback ){
        var self = this;
        Step(
            function(){
                var group = this.group();
                for( var i=0;i<entityIdList.length;i++ ){
                    self.retrieveEntityById( entityIdList[i], options, group() );
                }
            },
            function(err, results){
                callback( err, results );
            }
        );
    },

    // 
    // 
    // 
    retrieveEntityById: function( entity, options, callback ){
        var self = this, i, er, name, type, key, targetId;
        var entityId = _.isObject(entity) ? entity.id : entity;
        var entityKey = options.key_prefix + ':' + entityId;
        var ldlKey = options.key_prefix + ":status:" + Common.Status.LOGICALLY_DELETED;
        var entityDef;// = Common.entity.ids[entity.type];
        var ignoreStatus = _.isUndefined(options.ignoreStatus) ? false : options.ignoreStatus;
        var debug = null;//entityId == 1;// || options.debug

        // if(debug) log('retrieveEntityById ' + entityId + ' ' + entityKey + ' options: ' + JSON.stringify(options) );

        var multi = self.client.multi();

        // check that this entity is not logically deleted
        multi.sismember( ldlKey, entityId );
        multi.hget( entityKey, 'value' );

        // retrieve the entity
        multi.exec( function(err, replies){
            if( err ) throw err;

            if( (!ignoreStatus && replies[0]) || !replies[1] ){
                callback(entityId + ' not found');
                return;
            }
            
            var entityAttr = JSON.parse( replies[1] );
            entityAttr.id = entityId;

            type = entityAttr.type || (_.isObject(entity) ? entity.type : null);
            // delete entityAttr.type;
            entityDef = Common.entity.ids[type];

            if( !options.fetchRelated ){
                callback( null, entityAttr );
                return;
            }

            if( !entityDef && options.entityDefHint ){
                // JSON.stringify(options.entityDefHint)
                entityDef = Common.entity.ids[options.entityDefHint.type];
            }

            // if(debug ) log('hmm plinkyplonk ' + JSON.stringify(entityDef) );
            
            // if( !entityDef ){
            //     log('cant find entityDef for ' + JSON.stringify(entityAttr) );
            //     callback( null, entityAttr );
            // }

            // look for other relations that we should retrieve
            // if there are any collections associated with this entity then fetch their details
            if( entityDef.oneToMany ){
                // this is a collection - look for members
                // log('looking for members of ' + entityKey + ':items' );
                options.fetchSetList.push( {key:entityKey + ':items', name:'items', callback:function(params,result){
                    // log('setting ' + entityKey+':items on ' + JSON.stringify(entityAttr) );
                    entityAttr.items = result;
                }});
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
                                if( debug ) log('2 adding ' + name + ' ' + targetId + ' ' + entityDef.type );
                                options.fetchList.push( {id:targetId, name:name, type:entityDef.type} );
                            }
                        } else {
                            // look for set members
                            options.fetchSetList.push( {key:entityKey + ':' + name, name:name, callback:function(params,result){
                                entityAttr[params.name] = result;
                            }});
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

    // 
    // Retrieve a model from `this.data` by id.
    // 
    find: function(model, options, callback) {
        var i, self = this,
            item, entityId,
            retrieveOptions,
            collectionSetKey,
            result;
        var entityDetails = Common.entity.ids[model.type];
        
        var retrieveChildren = [];
        var itemCounts = [];
        var modelKey = [self.options.key_prefix, model.id].join(':');
        var ldlKey = options.key_prefix + ":status:" + Common.Status.LOGICALLY_DELETED;

        if( options.ignoreStatus )
            ldlKey = null;

        options._depth = options._depth || 1;
        // the fetchList contains entity ids which should be retrieved
        options.fetchList = [ model.id ];
        // the fetchSetList contains details of sets (of entity ids) which should be retrieved
        options.fetchSetList = [];
        options.result = {};


        var evalFetchList = function(){
            if( options.fetchSetList.length > 0 ){
                
                item = options.fetchSetList.shift();

                if( _.isObject(item) ){
                    self.client.sdiff( item.key, ldlKey, function(err,result){
                        if( err ) throw err;
                        // if( options.debug ) 
                        // log('result of set ' + item.key + ' ' + JSON.stringify(result) );
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

                        if( item.callback ){
                            item.callback( item, result );
                        }

                        // re-check if we need to fetch anything
                        evalFetchList();
                    });
                }
            } else if( options.fetchList.length > 0 ) {
                // pull the next
                entityId = options.fetchList.shift();

                if( _.isObject(entityId) ){
                    retrieveOptions = _.clone(options);
                    retrieveOptions.entityDefHint = entityId;
                    entityId = entityId.id;
                    // log('special fetch for ' + entityId + ' ' + JSON.stringify(retrieveOptions.entityDefHint) );
                } else
                    retrieveOptions = options;

                if( options.query ){
                    if( options.debug ) log('going for retrieve with query ' + JSON.stringify(options.query) );
                    self.retrieveEntityByQuery( options.query, retrieveOptions, function(err, retrievedEntityId){
                        if( err ){ callback(err); return; }

                        // set the resultant id on the mystery model to allow the parsing of the attributes to continue
                        if( retrievedEntityId )
                            model.set({id:retrievedEntityId});
                        // print_var( model );

                        // we have to remove the query in order to prevent unwanted recursion
                        delete options.query;
                        // re-check if we need to fetch anything else
                        evalFetchList();
                    });
                }
                else {
                    if( options.debug ) log('going for retrieve of ' + entityId );
                    self.retrieveEntityById( entityId, retrieveOptions, function(err,data){
                        if( err ){
                            // TODO : will it always matter that a model cant be found?
                            callback( err );
                            return;
                        }
                        // store result
                        options.result[ entityId ] = data;
                        // re-check if we need to fetch anything else
                        evalFetchList();
                    });
                }
                
            } else {
                if( options.debug ) log('finished fetchList retrieve');
                // if( options.debug ) print_var( options.result );
                callback( null, options.result );
            }
        };

        evalFetchList();
    }
     
});

var store = new RedisStorage(Common.config.sync.redis);
// var fwdCount = 0;

exports.sync = function(method, model, options) {
    var config = _.extend( _.clone(Common.config.sync.redis), options );
    var concluded = false;
    var resp, modelID;

    function forwardResult( err, result ){
        if( err ){
            if( options.error )
                options.error(err);
            else
                throw err;
            return;
        }
        if( options.success ){
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
            concluded = true;
            store.update( model, config, forwardResult );
            break;
        case 'update':
            concluded = true;
            store.update( model, config, forwardResult );
            break;
        case 'delete':
            concluded = true;
            store.delete( model, config, forwardResult );
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
            if( options.entity.set )
                options.entity.set('id', id);
            else
                options.entity.id = id;
            options.entity._uuidgen = true;
        }
        callback(err,id,options);
    });
}

exports.keys = function( callback ){
    store.client.keys( Common.config.sync.redis.key_prefix, function(err,result){
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
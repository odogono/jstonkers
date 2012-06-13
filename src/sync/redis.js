var redis = require("redis");


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
            i, len, date, status, serialised,
            self = this, 
            keyPrefix = self.options.key_prefix,
            initiateMulti = redisHandle instanceof redis.RedisClient,
            key,keys,val;

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

        // log('saving entity ' + entity.id );
        // print_var(entity);
        // delete entity._cid;

        serialised = entity.toJSON({referenceCollections:true});
        // print_var(serialised);

        key = keyPrefix + ':' + entity.id;
        var entityHashFields = Common.config.sync.redis.entity_hset;

        // convert date fields to times (for sorting purposes)
        if( serialised.created_at ){
            multi.hmset( key, 'created_at', new Date(serialised.created_at).getTime() );
        }

        if( serialised.updated_at ){
            multi.hmset( key, 'updated_at', new Date(serialised.updated_at).getTime() );
        }

        // multi.hmset( key, 'status', entity.status );


        // add entity fields to entity hash
        _.each( entityHashFields, function(field){
            if( entity[field] )
                multi.hmset( key, field, entity[field] );
        });


        // if the entity has specific keys it wants as fields, then apply so now
        if( entity.storeKeys ){
            keys = entity.storeKeys();
            for( i=0,len=keys.length;i<len;i++ ){
                // if( (val=entity[keys[i]]) || (val = entity.get([keys[i]])) )
                if( (val = serialised[keys[i]]) )
                    multi.hmset( key, keys[i], val );
            }
        }

        // add entity value to entity hash
        // print_ins(entity);
        // var value = _.clone(entity); 
        // delete value._cid;
        multi.hmset(key, 'value', JSON.stringify(serialised) ); //JSON.stringify(value) );

        // entity status index
        // print_ins( Common.status );
        // print_var( entity.attributes );
        status = entity.get('status');

        for( i in Common.Status ){
            // status = entity.get('status') || entity.status;
            if( status === Common.Status[i] )
                multi.sadd( keyPrefix + ':status:' + Common.Status[i], entity.id );
            else
                multi.srem( keyPrefix + ':status:' + Common.Status[i], entity.id );
            // log(entity.id + ' ' + Common.Status[i] );
        }



        // _.each(Common.Status, function(v,k){
        //     if( entity.status === v )
        //         multi.sadd( keyPrefix + ':status:' + v, entity.id );
        //     else    
        //         multi.srem( keyPrefix + ':status:' + v, entity.id );
        // });
        

        // entity type index
        multi.sadd( keyPrefix + ':' + entity.type, entity.id );

        if( entity.entityCollection ){
            multi.sadd( keyPrefix + ':' + entity.entityCollection.id + ':items', entity.id );
        }


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

        // log('ok then ' + entity.id );
        // log( mu)
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
        multi.scard( collectionKey + ':' + collection.get('name') );
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
            options.offset = collection.get('offset');
            options.limit = collection.get('page_size');    
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
        var flattenOptions = {toJSON:true,recurse:false};
        // var factoryOptions = {toJSON:true,exportAsMap:false};
        if( options.destroyRelated ) {
            flattenOptions.recurse = true;
        }

        var cidToModel = _.values( model.flatten(flattenOptions) );
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
            }

            multi.exec( function(err, replies){
                callback( err, entity );
            });

            return model;
        }

        if( options.debug ){
            // print_ins( cidToModel );
            // print_ins( _.values( model.flatten({toJSON:true}) ) );
        }

        // a normal delete is actually setting the status of each model to logically deleted
        for( i in cidToModel ){
            cidToModel[i].status = Common.Status.LOGICALLY_DELETED;
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
        // print_var( cidToModel );
        
        
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


    /**
    *
    */
    retrieveEntityById: function( entity, options, callback ){
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

        // if(options.debug) log('retrieveEntityById ' + entity.id );

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
    },


    
    // Retrieve a model from `this.data` by id.
    find: function(model, options, callback) {
        var i, self = this,
            info,
            collectionSetKey,
            result;
        var entityDetails = Common.entity.ids[model.type];
        
        var retrieveChildren = [];
        var itemCounts = [];
        var modelKey = [self.options.key_prefix, model.id].join(':');

        options._depth = options._depth || 1;

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
        }
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

    log('sync with ' + method );

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
            // print_ins( entity );
            // process.exit();
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
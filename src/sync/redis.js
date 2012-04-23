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
            date,
            self = this,
            keyPrefix = self.options.key_prefix,
            key;

        if( !entity.id ){
            // get a new id for the entity
            exports.generateUuid(function(err,id){
                if( err ) throw err;
                entity.id = entity.type + '.' + id;
                entity._uuidgen = true;
                log('saving entity ' + entity.id);
                // call ourselves again
                self.saveEntity( redisHandle, entity, options, callback );
            });
            log('proceeding');
            return;
        }

        if( redisHandle instanceof redis.RedisClient ){
            multi = redisHandle.multi();
        }


        // print_var(entity);
        // delete entity._cid;

        key = keyPrefix + ':' + entity.id;
        var entityHashFields = Common.config.sync.redis.entity_hset;

        // convert date fields to times (for sorting purposes)
        if( entity.created_at ){
            multi.hmset( key, 'created_at', new Date(entity.created_at).getTime() );
            // delete entity.created_at;
        }

        if( entity.updated_at ){
            multi.hmset( key, 'updated_at', new Date(entity.updated_at).getTime() );
            // delete entity.updated_at;
        }

        // add entity fields to entity hash
        _.each( entityHashFields, function(field){
            if( entity[field] )
                multi.hmset( key, field, entity[field] );
        });

        // add entity value to entity hash
        // print_ins(entity);
        var value = _.clone(entity); 
        delete value._cid;
        multi.hmset(key, 'value', JSON.stringify(value) );

        // entity status index
        _.each(Common.Status, function(v,k){
            if( entity.status === v )
                multi.sadd( keyPrefix + ':status:' + v, entity.id );
            else    
                multi.srem( keyPrefix + ':status:' + v, entity.id );
        });
        
        // entity type index
        multi.sadd( keyPrefix + ':' + entity.type, entity.id );

        if( options.collectionSetKey )
            multi.sadd( options.collectionSetKey, entity.id );

        if( redisHandle instanceof redis.RedisClient ){
            multi.exec( function(err, replies){
                callback( err, entity );
            });
        }
    },


    deleteEntity: function( redisHandle, entity ){

    },

    getEntity: function( redisHandle, entity ){
        /*multi.hgetall( modelKey );

        // next get the counts for each of the collections
        _.each( entityDetails.ER, function(er){
            if( er.oneToMany ){
                var collectionName = (er.name || er.oneToMany).toLowerCase();
                collectionSetKey = modelKey + ':' + collectionName;
                multi.scard( collectionSetKey );
                itemCounts.push( collectionName );
            }
        });
        
        multi.exec( function(err,replies){
            print_ins( arguments );
            if( replies ){
                result = replies[0].value;

                // result = JSON.parse( replies[0] );
                
                // set item counts
                for( i=0;i<itemCounts.length;i++ ){
                    if( replies[i+1] ){
                        result[itemCounts[i]] = { item_count:replies[i+1] };
                    }
                }
                // print_ins( result );
            }
            callback( err, result );
        })//*/
    }
});

_.extend( RedisStorage.prototype, {
    

    createCollection: function(collection, options, callback){
        var self = this,
            key,
            collectionSetKey,
            keyPrefix = self.options.key_prefix,
            entityHashFields = Common.config.sync.redis.entity_hset;

        // log('creating collection');

        collection.set('id',uuid());
        
        // var collectionJSON = collection.toJSON({noCounts:true});
        // var json = Common.entity.Factory.toJSON( collection );

        // print_ins( collectionJSON );
        // create a set for the collection

        var multi = self.client.multi();

        // save the collection
        if( collection.get('name') ){
            // multi.set( keyPrefix + ':' + collection.id, JSON.stringify(collectionJSON) );
            collectionSetKey = keyPrefix + ':' + collection.id + ':' + collection.get('name');
        }

        var itemsJSON = Common.entity.Factory.toJSON( collection.items.models );

        _.each( itemsJSON, function(ent){
            self.saveEntity( multi, ent );
        });

        multi.exec( function(err, replies){
            callback(err, replies);
        });
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
        // log('retrieveCollectionBySet: ' + setKey + ' ' + JSON.stringify(options) );
        multi.scard(setKey);

        self.executeSort( multi, setKey, sortBy, options.key_prefix + ':*->value', options );

        multi.exec( function(err, replies){
            if( replies ){
                result.item_count = replies[0];
                result.items = _.map( replies[1], function(r){ return JSON.parse(r); });
            }
            callback( err, result );
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
                            self.executeSort( multi, diffKey, null, valueKey, {offset:collection.get('offset'), limit:collection.get('limit')} );

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

    // generateUuids: function( models, options, callback ){
        
    //             Step(
    //                 function(){
    //                     exports.generateUuid( this );
    //                 },
    //                 function(err,id){
    //                     if( err ) throw err;
    //                     ent.id = ent.type + '.' + id;
    //                     log('generated id ' + ent.id);
    //                 }
    //             );
    //         }
    //     });
    // },

    // Update a model by replacing its copy in `this.data`.
    update: function(model, options, callback) {
        var self = this;
        var keyPrefix = self.options.key_prefix;
        var entityDetails = Common.entity.ids[model.type];        
        var collectionSetKey;
        var cidToModel;

        // var m = self.client.multi();

        // print_var(jsonOutput);
        // process.exit();

        var assignIdToEntity = function(entity, callback){
            exports.generateUuid( function(err,id){
                entity.id = entity.type + '.' + id;
                callback(null,entity);
            });
        };

        // save each of the models first - this is to ensure they have a valid id
        Step(
            function(){
                // A build a map of model cids to models, so that we can later update ids if need be
                cidToModel = Common.entity.Factory.toJSON( model, {toJSON:false,exportAsMap:true} );
                
                // check the models have ids, if not then generate some for them
                var group = this.group();

                _.each( cidToModel, function(ent){
                    if( ent.isNew() ){
                        assignIdToEntity(ent,group());
                    }
                });
            },
            function saveEntities(){
                // referenceChildren means that the parents will have references to children
                var jsonOutput = Common.entity.Factory.toJSON( cidToModel, {referenceItems:false,debug:true} );

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
                callback(err,model);
            }
        );


        // log('updating:');
        // print_var(jsonOutput);

        

        // var entityHashFields = Common.config.sync.redis.entity_hset;

        // set each of the models
        // _.each( jsonOutput, function(ent){
            // self.saveEntity( multi, ent );
        // });

        // multi.exec( function(err, replies){
        //     callback(err, model);
        // });
        
        return model;
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

        if( model instanceof Common.entity.EntityCollection ){
            if( !model.id ){
                this.retrieveCollectionByType( model, options, callback );
            }
            else{

                this.retrieveCollectionById( model,options,callback);
            }
        }
        else {

            var multi = self.client.multi();
            // first get the base model
            multi.hgetall( modelKey );

            // log('find with ' + inspect(options) );
            // next get the counts for each of the collections
            _.each( entityDetails.ER, function(er){
                if( er.oneToMany ){
                    var collectionName = (er.name || er.oneToMany).toLowerCase();
                    collectionSetKey = modelKey + ':' + collectionName;
                    multi.scard( collectionSetKey );
                    itemCounts.push( collectionName );
                    if( options['retrieve'+_.capitalize(collectionName)] ){

                        retrieveChildren.push( collectionName );
                    }
                }
            });
            
            multi.exec( function(err,replies){
                var callCallback = true;
                if( replies ){
                    var entityFields = replies[0];

                    if( entityFields ){
                        result = JSON.parse(entityFields.value);
                        if( entityFields.created_at )
                            result.created_at = new Date(parseInt(entityFields.created_at,10)).toISOString();
                        if( entityFields.updated_at )
                            result.updated_at = new Date(parseInt(entityFields.updated_at,10)).toISOString();
                    }


                    // set item counts
                    for( i=0;i<itemCounts.length;i++ ){
                        if( replies[i+1] ){
                            result[itemCounts[i]] = { item_count:replies[i+1] };
                        }
                    }

                    if( retrieveChildren.length > 0 ){
                        callCallback = false;

                        Step(
                            function(){
                                var group = this.group();
                                for( i=0;i<retrieveChildren.length;i++ ){
                                    self.retrieveCollectionBySet( modelKey +':' + retrieveChildren[i], null, options, group() );
                                }            
                            },
                            function(err,entities){
                                if( entities ){
                                    for( i=0;i<retrieveChildren.length;i++ ){
                                        result[ retrieveChildren[i] ] = entities[i];
                                    }
                                }
                                callback(err,result);
                            }
                        );
                    }
                    
                }

                if( callCallback ){
                    callback( err, result );
                }
            })
        }
    },
     
});

var store = new RedisStorage(Common.config.sync.redis);


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
        }
        
        if( options.success ){
            options.success(result);
        }
    };

    // log('sync with ' + method );
    switch( method ){
        case 'read':
            concluded = true;
            store.find( model, config, forwardResult );
            return;
        case 'create':
            if( model instanceof Common.entity.EntityCollection ){
                concluded = true;
                store.createCollection( model, config, forwardResult );
            } else {
                concluded = true;
                store.update( model, config, forwardResult );
            }
            break;
        case 'update':
            concluded = true;
            store.update( model, config, forwardResult );
            break;
        case 'delete':
            break;
    }

    if( !concluded ){
        if (resp) {
            options.success(resp);
        } else {
            options.error('Record not found');
        }
    }
}

exports.generateUuid = function( options, callback ){
    var config = Common.config.sync.redis;
    var prefix = config.key_prefix;
    var key = prefix + ':' + config.uuid.key;

    if( _.isFunction(options) && callback === undefined ){
        callback = options;
        options = undefined;
    }

    // store.client.incr( key, callback );
    store.client.incr( key, function(err,id){
        callback(err,id,options);
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
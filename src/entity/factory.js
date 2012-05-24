var entity = module.parent.exports;

var exporters = {};
var importers = {};

exporters.generic = function( result, type, ent, options ){
    var o2m = [];
    var o2o = [];
    var json;// = ent.toJSON();

    options || (options={});
    json = ent.toJSON();

    var entityDetails = entity.ids[type];
    var entityCollectionOptions = _.extend( {noCounts:true,collectionAsIdList:true}, options );

    if( options.toJSON ){
        json['type'] = ent.type;
        if( ent.id ){
            json['id'] = ent.id;
        } else {
            json['_cid'] = ent.cid;
        }
        result[ ent.cid ] = json;
    }
    else {
        result[ ent.cid ] = ent;
    }

    // if( options.special ) log('hey wat ' + json.type + ' ' + JSON.stringify(json) );
    // print_var( ent );
    
    // if( options.debug ) print_var(json);



    // oneToMany relationships have a collection which needs to be traversed
    _.each( entityDetails.ER, function(er){
        var exportResult;

        if( er.oneToMany ){

            var key = er.name || er.oneToMany;
            key = key.toLowerCase();

            // visit each child, and export each to the result
            if( ent[key] && ent[key] instanceof Common.entity.EntityCollection ){

                ent[key].items.each( function(child){
                    if( !result[child.cid] ){
                        exporters[er.type] ?
                            exporters[er.type]( result, er.type, child, options ) :
                            exporters.generic( result,er.type,child, options);
                    }
                });

                if( options.toJSON ){
                    if( entityCollectionOptions.referenceItems && ent[key].length > 0 ){
                        json[key] = ent[key].toJSON( entityCollectionOptions );
                        // o2m.push( ent[key].toJSON( entityCollectionOptions ) );
                    }
                }
            }
        }
    });

    
    // convert any entity references

    _.each( json, function(value,key){
        if( value instanceof Common.entity.Entity ){
            if( options.exportRelations && !result[value.cid] ){
                exporters[value.type] ?
                    exporters[value.type]( result, value.type, value, options ) :
                    exporters.generic( result,value.type, value, options);
            }
            if( options.toJSON ){
                if( !options.exportRelations )
                    json[key] = value.id;
                else
                    json[key] = value.id || value.cid;
            }
        }
    });




    // print_var( result );
    if( options.toJSON ){
        // if( o2m.length > 0 )
            // json['o2m'] = o2m;
        if( o2o.length > 0 )
            json['o2o'] = o2o;
        return json;
    }

    return ent;
};

/*
exports.getEntities = function( exportEntity, options ){
    options = (options || {});
    var result = options.result || {};

    if( _.isArray(exportEntity) ){
        var subOptions = _.extend({result:result}, options);
        _.each(exportEntity, function(sub){
            exports.getEntities( sub, subOptions );    
        });
        return result;
    }

    if( !_.isObject(exportEntity) )
        return result;

    var type = exportEntity.type || exportEntity.get('type');

    if( !type )
        throw new Error('expected type from entity export' );


}//*/

exports.toJSON = function( exportEntity, options ){
    options = (options || {});
    var result = options.result || {};

    if( options.toJSON === undefined )
        options.toJSON = true;

    // if we have a map of ids to entities, then break out the entities into an array
    if( _.isObject(exportEntity) && !(exportEntity instanceof Common.entity.Entity) ){
        exportEntity = _.values(exportEntity);
    }

    // if we are dealing with an array, apply each one in turn
    if( _.isArray(exportEntity) ){
        var subOptions = _.extend({result:result}, options);
        _.each(exportEntity, function(sub){
            exports.toJSON( sub, subOptions );    
        });
        return result;
    }

    if( !_.isObject(exportEntity) )
        return result;

    var type = exportEntity.type || exportEntity.get('type');

    if( !type )
        throw new Error('expected type from entity export' );

    if( exporters[type] )
        exporters[type]( result, type, exportEntity, options );
    else
        exporters.generic( result, type, exportEntity, options );

    if( options && options.exportAsMap )
        return result;

    var typedResult = [];
    _.each( result, function(ent,id){
        typedResult.push( ent );
    });
    
    return typedResult;
}


exports.toEntityJSON = function( exportEntity, options ){
    var result = exportEntity.toJSON();
    var entityDetails = entity.ids[exportEntity.type];

    _.each( entityDetails.ER, function(er){
        if( er.oneToMany ){
            var key = (er.name || er.oneToMany).toLowerCase();
            if( exportEntity[key] && exportEntity[key] instanceof Common.entity.EntityCollection ){
                if( exportEntity[key].length > 0 )
                    result[key] = exportEntity[key].map( function(e){ return e.id });
            }
        }
        else if( er.oneToOne ){
            _.each( entityKeys(exportEntity, er.type), function(k){
                result[k] = result[k].id;
            });
        }
    });

    return result;
}

exports.collectionToJSON = function( collection, options ){
    var result = collection.toJSON(options);
    options || (options={});

    if( collection.length > 0 ){
        if( options.full ){
            result.items = collection.map(function(i){ return i.toJSON(options) });
        }
        else
            result.items = collection.map(function(i){ return i.id } );
    }

    return result;
}


// 
// returns the keys that start
// 
function entityKeys( ent, type ){
    var prefix = '_'+type+':'
    return _.filter(
            _.keys(ent.attributes), 
            function(k){ 
                return _.startsWith( k, prefix );
            });
};


/**
    Takes an array of entities and resolves all the
    relationships between them
*/
exports.resolveEntityList = function( data, options, callback ){
    var resolveAll = false,
        resolver = options ? options.resolver : null;

    // look at the options for which references should be fetched
    // if( options.fetch ){
    //     log('fetching these: ' + inspect(options.fetch) );
    // }
    
    // the default resolver is to find the entity in the data object
    if( !resolver ){
        resolveAll = true;
        resolver = function(){};
        resolver.find = function(model,options,callback){
            // log('data resolver find ' + model );
            if( _.isString(model) )
                callback(null,data[model]);
            else if( model.id )
                callback(null,data[model.id]);
            else
                callback(null,null);
        }
    }

    // resolve entity references
    _.each( data, function(ent){

        // fetch a description of this types ER
        var ers = Common.entity.getER( ent.type );

        // if there are no specified ers, then just return
        if( _.isEmpty(ers) )
            return;

        if( options.debug ) log('resolving references for ' + ent.type);

        _.each( ers, function(er){
            var key = '_'+(er.name || er.type);
            var keys = entityKeys( ent, (er.name || er.type) );

            if( er.oneToMany ){
                // if( options.debug ) log('looking for o2m ' + key);
                // do we have the orders to restore this ?

                if( ent.has(key) ){

                    // remove the reference from the entity
                    ent.unset( key, {silent:true} );    
                }
            }
            else if( er.oneToOne ){

                _.each( keys, function(k){
                    // if( options.debug ) log('looking for o2o ' + key + ' in ' + k);
                    if( resolver && resolveAll ){
                        resolver.find( ent.get(k), options, function(err,refEntity){
                            ent.set( k, refEntity );
                            Common.entity.addEntityToEntity( ent, refEntity, k );
                        });
                    }
                    else
                        ent.unset( k );
                });
    
                // if( ent.has(key) ){
                //     // log('resolving ' + JSON.stringify(er) );
                //     if( resolver && resolveAll ){

                //         resolver.find( ent.get(key), options, function(err,refEntity){
                //             // set the reference
                //             ent.set(key, refEntity, {silent:true});

                //             // add the reference in the opposite direction
                //             Common.entity.addEntityToEntity( ent, refEntity, key );
                //         });
                //     }
                //     else{
                //         // remove the reference from the entity
                //         ent.unset( key, {silent:true} );
                //     }
                // }
            }
            
        });

        /*
        // check whether the entity has a refering entity
        _.each( Common.entity.ids, function(undefined,eid){

            Step(
                function(){
                    var group = this.group(),
                        entKey = '_'+eid,
                        entRef = ent.get(entKey);

                    if( !entRef )
                        return;
                    
                    log('finding refEntity for ' + inspect(entRef) );
                    // log( resolver.find );
                    resolver.find( entRef, options, function(err,refEntity){
                        if( err ) throw(err);
                        if( refEntity ){
                            // log('got ' + refEntity.id );
                            // set the reference
                            ent.set(entKey, refEntity, {silent:true});

                            // add the reference in the opposite direction
                            Common.entity.addEntityToEntity( ent, refEntity, entKey );
                        }
                        group();
                    } );
                },
                function(err){
                    callback(err, data );
                }
            );

            
        });//*/
    });
    if( callback )
        callback(null, data );

    return data;
}


/**
    Takes a JSON document and returns a map of entity ids to entity instances
*/
exports.createFromJSON = function( data, options, callback ){
    options || (options={});

    // the result is a map of entity IDs to entities
    var result = {};

    if( _.isArray(data) ){
        // an array of JSON entities
        _.each( data, function(ent){
            if( ent.type && importers[ent.type] )
                importers[type]( result, ent.type, ent );
            else {
                // log('creating ' + inspect(ent) );
                var inst = entity.Entity.create( ent );
                result[inst.id] = inst;
            }
        })
    } else if( _.isObject(data) ){

        if( data.id ){
            // log('creating with ' + JSON.stringify(data) );
            var inst = entity.Entity.create( data );
            // print_ins( inst );
            result[inst.id] = inst;
        } else{
            _.each( data, function(values,type){
                _.each( values, function(ent){
                    if( importers[type] )
                        importers[type]( result, type, ent );
                    else {
                        var inst = entity.Entity.create( ent );
                        result[inst.id] = inst;
                    }
                });
            });
        }
    }

    
    // if( options.resolveER ){
        // log('now resolving entity list with ' + options );
    return exports.resolveEntityList( result, options, callback );
    // }
    // else
    //     callback( null, result );
};


exports.createFromFile = function( filePath, callback ){
    Common.fs.readFile( filePath, function (err, data) {
        if (err) throw err;
        data = JSON.parse(data);
        exports.createFromJSON(data, null, callback);
    });
}
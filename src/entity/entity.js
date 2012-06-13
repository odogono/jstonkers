var erFuncs = require('./entity_relationship');
// exports.schema = 'urn:schemas-opendoorgonorth:heroes:entity#';

var Entity = exports.Entity = Backbone.Model.extend({

    defaults:{
        status: Common.Status.INACTIVE,
        created_at:new Date(),
        updated_at:new Date()
    },

    initialize: function(){
    },

    setEntity: function( type, instance, options ){
        this.set( type, instance, options );
    },

    // converts a single callback function into something backbone compatible 
    convertCallback: function(options,callback){
        // log('convertCallback ' + JSON.stringify(options ) );
        options || (options={});
        if( _.isFunction(options) ){
            callback = options;
            options = {};
        }
        var debugit = options.debugB;
        if( callback ){
            options = _.extend(options,{
                success: function(model,resp){
                    // if( options.ignoreStatus ){
                    //     log('ignoreStatus from here ' + model.cid );
                    // }
                    // if( Common.debug ) log('success cb ' + model.cid + ' ' + JSON.stringify(options) );
                    // log('finished success');
                    callback( null, model, resp, options );
                    // if( debugit ){
                    //     log('Common.debug')
                    //     print_ins( arguments );
                    //     process.exit();
                    // }
                },
                error: function(model,err,resp){
                    // if( debugit ){
                    //     log('error called');
                    //     print_ins( arguments );
                    //     process.exit();
                    // }
                    callback( err, model, resp );
                }
            });
        }
        return options;
    },

    // provide a more common success failure style
    // saveCB( {key:'value'}, function(){} )
    saveCB: function(key, value, options, callback){
        var attrs;
        // log('saveCB with ');
        // print_ins( arguments );
        if( arguments.length === 1 ){
            callback = key;
            options = {};
        }
        else if( _.isObject(key) || key == null){
            attrs = key;
            callback = options;
            options = value;
            // log('cb?' + arguments.length );
        } else {
            attrs = {};
            attrs[key] = value;
        }

        options = this.convertCallback( options, callback );
        return this.save( attrs, options );
    },

    saveRelatedCB: function( key, value, options, callback){
        var attrs;

        if( _.isObject(key) || key == null){
            attrs = key;
            callback = options;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        options = this.convertCallback( options, callback );
        options.saveRelated = true;
        return this.save( attrs, options );
    },

    fetchCB: function(options,callback){
        options = this.convertCallback( options, callback );
        return this.fetch( options );
    },

    fetchRelatedCB: function(options,callback){
        options = this.convertCallback( options, callback );
        options.fetchRelated = true;
        return this.fetch( options );
    },

    destroyCB:function(options,callback){
        options = this.convertCallback(options,callback);
        return this.destroy(options);
    },

    destroyRelatedCB: function( options,callback ){
        options = this.convertCallback(options,callback);
        options.destroyRelated = true;
        return this.destroy(options);  
    },

    set: function(key, value, options) {
        var attrs, attr, val,entity,subEntity;
        var self = this, entityDef;

        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

        if( attrs.type ){
            // log('setting type to ' + attrs.type );
            this.type = attrs.type;
        }

        if( options && options.setRelated ){
            var relatedMap = this.flatten();
            var relatedOptions = _.clone(options);
            delete relatedOptions.setRelated;

            for(var id in relatedMap){
                entity = relatedMap[id];
                entity.set( attrs, relatedOptions );
            }

            return this;
        }

        entityDef = exports.ids[this.type || attrs.type];

        // if( options && options.setRelated ) log('set ' + JSON.stringify(attrs));

        if( entityDef && entityDef.ER ){
            _.each( entityDef.ER, function(er){
                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                var erData = attrs[erName];

                // if( options && options.setRelated ) log('set ' + JSON.stringify(attrs) + ' ' + erName);
                if( !erData )
                    return;

                if( er.oneToOne ){
                    if(!(erData instanceof Entity)){
                        // TODO AV : could maybe get this model reference from elsewhere?
                        
                        try{
                            subEntity = exports.create( erData );
                        } catch( e ){
                            log('failed creating with ' + JSON.stringify(erData) );
                            // throw e;
                            // process.exit();
                        }
                        if( subEntity ) {
                            attrs[erName] = subEntity;
                        } else
                            delete attrs[erName];
                    }
                }
                else if( er.oneToMany && !(erData instanceof Common.entity.EntityCollection)){
                    if( !self[erName] ){
                        log('no existing EntityCollection for ' + erName );
                        // self[erName] = Common.entity.createEntityCollection();
                    }
                    if( self[erName] ){
                        self[erName].set( erData );
                    }

                    delete attrs[erName];
                }
            });
        }

        var result = Backbone.Model.prototype.set.apply( this, arguments );
        return result;
    },//*/

    parse: function(resp, xhr, options){
        if( !resp )
            return resp;


        
        var i, er, self = this,
            targetId = this.id,
            origResp = resp;
        // var removeId = options && !_.isUndefined(options.removeId) ? options.removeId : false;
        var removeId = options && options.removeId;

        if( options && options.parseFor ){
            targetId = options.parseFor;
        }
        if( resp[targetId] ){
            resp = resp[targetId];
        }

        var entityDef = exports.ids[ resp.type || this.type ];


        var associateRelations = function(data){
            var i, er, erId, items, erName, entityDef;
            if( !data.type )
                return;
            if( !(entityDef = exports.ids[ data.type ]) )
                return;
            if( removeId ){
                delete data['id'];
            }
            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                erId = data[erName];

                
                if( er.oneToOne ){
                    
                    if( origResp[erId] ){
                        data[erName] = associateRelations( origResp[erId] );
                    }
                }
                else if( er.oneToMany && erId ){

                    if( _.isArray(erId) ){
                        items = _.map( erId, function(eid){
                            return associateRelations( origResp[eid] );
                        });
                        data[erName] = { items:items };
                    } else{
                        if( erId.items ){
                            erId.items = _.map( erId.items, function(eid){
                                if( !_.isObject(eid) )
                                    return associateRelations( origResp[eid] );
                                return eid;
                            });
                        }
                    }
                }
            }
            return data;
        }
        
        // set any ER properties
        if( resp !== this ){
            associateRelations( resp );
        }

        // if( Common.debug ){
        //     log('parsing');
        //     print_ins( resp );
        // }
        
        return resp;
    },

    removeID: function(options){
        var i, er, erName,child;
        var entityDef = exports.ids[this.type];
        options = options || {};
        var recurse = _.isUndefined(options.recurse) ? false : options.recurse;

        this.unset('id');

        // log('removing id for ' + this.type);
        // print_ins( this );

        if( !entityDef.ER ){
            // log('no relations for ' + this.type );
            return;
        }

        for( i in entityDef.ER ){
            er = entityDef.ER[i];
            erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();

            if( er.oneToOne ){
                if( recurse && (child = this.get(erName)) ){
                    child.removeID( options );
                }
            } else if( er.oneToMany ){
                if( recurse && (child = this[erName]) ){
                    child.removeID( options );
                }
            }
        }
    },

    clone: function(options) {
        options = options || {};
        var recurse = _.isUndefined(options.recurse) ? false : options.recurse;

        var flattenOptions = {toJSON:true, recurse:false, relations:false};
        if( recurse ){
            flattenOptions.recurse = true;
            flattenOptions.relations = true;
        }

        var flat = this.flatten(flattenOptions);
        var parsed = this.parse( flat, null, {parseFor:this.id,removeId:true} );

        var result = new this.constructor( parsed );
        return result;
    },

    toJSON: function( options ){
        var i, entityDef, er, erName;
        options || (options = {});
        var doRelations = options.referenceCollections;//options.relations;
        var result = Backbone.Model.prototype.toJSON.apply( this, arguments );

        if( doRelations ){
            entityDef = Common.entity.ids[this.type];

            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                // def = Common.entity.ids[ er.type ];
                // log('entity.toJSON: ' + erName + ' ' + JSON.stringify(er) );

                if( er.oneToOne ){
                    // if( doRecurse && (child = this.get(erName)) ){
                        // child.flatten( options );
                    // }
                } else if( er.oneToMany ){
                    // if( doRecurse && (child = this[erName]) ){
                        // child.flatten(options);
                    // }
                    
                    // if( options.toJSON && options.referenceItems && this[erName].length > 0 ){
                        // outgoing[erName] = this[erName].toJSON( {collectionAsIdList:true} );
                    // }
                    // print_ins( this[erName] );
                    result[erName] = this[erName].id;// || this[erName].cid;
                }
            }
            // print_var( result );
        }

        return result;
    },

    // flattens this instance to a map of entity ids entities
    // 
    // options:
    //      - recurse : traverse through defined relations and add to result
    flatten: function( options ){
        var i, er, erName,child,childId;
        options = options || {};
        var result = options.result = (options.result || {});
        var id = this.id || this.cid;
        var self = this, outgoing;
        
        // log('flattening entity ' + id);

        // recursing through found relations is the default
        var doRecurse = _.isUndefined(options.recurse) ? true : options.recurse;
        // exporting relation references is the default
        var doRelations = _.isUndefined(options.relations) ? true : options.relations;

        if( !result[id] ){
            if( options.toJSON ){
                result[id] = outgoing = this.toJSON(options);

                outgoing['type'] = this.type;
                if( this.id )
                    outgoing['id'] = this.id;
                else
                    outgoing['_cid'] = this.cid;

            }else
                result[id] = outgoing = this;

            var entityDef = Common.entity.ids[this.type];

            var o2oNames = {};
            var o2mNames = {};

            /*
            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();

                if( er.oneToOne )
                    o2oNames[ erName ] = erName;
                else if( er.oneToMany )
                    o2mNames[ erName ] = erName;
            }//*/

            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                // def = Common.entity.ids[ er.type ];
                // log('exam ER ' + JSON.stringify(entityDef) + ' ' + JSON.stringify(er) );
                // print_ins( Common.entity.ids );
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                if( er.oneToOne ){
                    if( doRecurse && (child = this.get(erName)) ){
                        child.flatten( options );
                    }
                } else if( er.oneToMany ){
                    if( doRecurse && (child = this[erName]) ){
                        child.flatten(options);
                    }
                    
                    if( options.toJSON && options.referenceItems && this[erName].length > 0 ){
                        outgoing[erName] = this[erName].toJSON( {collectionAsIdList:true} );
                    }
                }
            }

            // if( options.allEntities ){
                for( i in this.attributes ){
                    child = this.attributes[i];

                    /*if( o2oNames[i] ){
                        if( doRecurse && (child = this.get(erName)) ){
                            child.flatten( options );
                        }
                    }
                    else if( o2mNames[i] ){
                        if( doRecurse && (child = this[erName]) ){
                            child.flatten(options);
                        }
                        if( options.toJSON && options.referenceItems && this[erName].length > 0 ){
                            outgoing[erName] = this[erName].toJSON( {collectionAsIdList:true} );
                        }
                    }
                    else//*/
                    if( child instanceof exports.Entity ){
                        childId = child.id || child.cid;
                        if( options.allEntities && doRecurse )
                            child.flatten(options);
                        
                            if( options.toJSON ){
                                if( doRelations )
                                    outgoing[i] = child.id || child.cid;
                                else
                                    delete outgoing[i];
                            }
                        
                    }
                }
            // }

        }
        return result;
    }

});


// exports.Entity = Entity;




// returns constituent parts of an id - the type and id
exports.splitId = function( id ){
    var result = { id:id };
    if( id.indexOf('.') != -1 ){
        result.type = id.substring( 0, id.indexOf('.') );
    }
    return result;
}


/**
*   The preferred means of creating a POI
*/
exports.create = function( type, attrs, options ) {
    var i,result;
    var debug = options && options.debug;

    if( _.isObject(type) && !type.__super__ ){
        options = attrs;
        attrs = type;
        type = attrs.type;
    }
    else if( _.isObject(type) && _.isObject(attrs) && type.type ){
        type = type.type;
    }
    else if( _.isObject(type) ){
        options = attrs;
        attrs = type;
        type = attrs.type;
        if( !type && attrs.id && attrs.id.indexOf('.') > 0 )
            type = attrs.id.substring( 0, attrs.id.indexOf('.') );
    }
    else if( attrs ) { //_.isString(attrs) ){
        if( !_.isObject(attrs) )
            attrs = { id:attrs };
    }else{
        attrs = (attrs || {});
    }

    attrs.created_at = new Date();
    attrs.updated_at = new Date();

    if( _.isObject(type) ){
        // attrs.id = type.type + '.' + uuid();
        // if( type instanceof Backbone.Model && type.type )
        if( type.type )
            type = type.type;
        // else if( type.__super__ )
    }
    else {
        if( _.isString(type) && type.indexOf('.') != -1 ){
            attrs.id = type;
            type = type.substring( 0, type.indexOf('.') );
        }
        // else if( attrs.id === undefined ){
            // attrs.id = type + '.' + uuid();
        // }
    }

    if( type === undefined ){
        throw new Error('undefined type' );
    }

    // if( attrs.id.indexOf(type) !== 0 )
        // attrs.id = type + '.' + attrs.id;

    // look for ER properties
    var entityDef = exports.ids[type];
    var erProperties = {};

    if( entityDef === undefined )
        throw new Error(type + ' not found');

    
    // if there are any ER properties in the attrs, take them out
    // for application later on
    _.each( entityDef.ER, function(er){
        var collectionName;
        if( er.oneToMany ){
            collectionName = (er.name || er.oneToMany).toLowerCase();
            if( attrs[collectionName] ){
                erProperties[collectionName] = attrs[collectionName];
                delete attrs[collectionName];
            }
        }
    });



    // if( entityDef.create ){
        // result = entityDef.create( attrs, options );
    // }else{
        // if( options && options.debug ) log('creating with ' + JSON.stringify(attrs) );
        result = new entityDef.entity( attrs, options );
        // if( options && options.debug ) print_ins( result );
    // }
    result.type = type;
    
    // apply any sub properties that were found earlier
    _.each( erProperties, function(props,collectionName){
        var setFn = 'set' + _.capitalize(collectionName); 
        if( result[setFn] ){
            result[setFn]( props );
        }
        else if( result[collectionName] ){
            result[collectionName].set( props );
        }
    });
    return result;
};


exports.ids = {};
exports.names = {};
exports.entities = {};


// normalises the type of an entity
exports.getEntityFromType = function( type ){
    if( type === null || type === undefined )
        return null;
    if( _.isObject(type) && type.type )
        type = type.type;
    if( !_.isString(type) )
        return null;
    if( exports.ids[type.toLowerCase()] ){
        return exports.ids[type.toLowerCase()];
    }
    if( exports[type.toUpperCase()] ){
        return exports[type.toUpperCase()];
    }
    if( exports['TYPE_' + type.toUpperCase()] ){
        return  exports.ids[exports['TYPE_' + type.toUpperCase()]];
    }
    // look for schema
    return null;
}

// returns entity relationship details for a given type
exports.getER = function( type ){
    type = exports.getEntityFromType( type );
    return type.ER;
}

function registerEntityType( entityDef, options ){
    var schema;

    options = (options || {});

    if( entityDef.schema ){
        // log('schema found for ' + entityDef.schema );//+ ' ' + inspect(entityDef) );
        
        var schemaValue = Common.schema.getSchemaValue( entityDef.schema );
        entityDef.type = schemaValue.id.substring(1);
        entityDef.name = (schemaValue.properties.name) ? schemaValue.properties.name : entityDef.type;
        if( schemaValue.er ){
            entityDef.ER = schemaValue.er;
        }
    }
    else{
        entityDef.name = entityDef.name || entityDef.type;
    }
    
    if( !entityDef.type ){
        return;
    }

    entityDef.name = _.classify(entityDef.name);

    if( !entityDef.entity ){
        entityDef.entity = exports.Entity.extend({});
    }

    if( !entityDef.ER )
        entityDef.ER = [];

    // entityDef.spoon = true;
    if( options.oneToMany ){
        entityDef.oneToMany = options.oneToMany;
    }
    if( options.create ){
        entityDef.create = options.create;
    }

    // print_ins(entityDef);

    // add to entities
    exports[entityDef.name] = exports.entities[entityDef.name] = entityDef;
    
    exports.ids[entityDef.type] = entityDef;
    exports.names[entityDef.type] = entityDef.name;
    // log('exporting ' + 'TYPE_' + _.underscored(entityDef.name).toUpperCase() );
    exports['TYPE_' + _.underscored(entityDef.name).toUpperCase()] = entityDef.type;
}


/**
*   Registers a new entity type 
*   - the incoming object must have a type and entity field
*/
exports.registerEntity = function( entityDef, entity, options ){
    // check for a direct registration of an entity
    if( _.isObject(entity) && entity.__super__ ){
        // the first arg may be the type of the entity
        if( _.isString(entityDef) ){
            entityDef = { type:entityDef };
            entity.type = entityDef.type;
        }
        entityDef.entity = entity;
        options = options || {};
    }
    else if( _.isString(entityDef) ){
        // attempt to load
        entityDef = require('./' + entityDef);
    }

    registerEntityType( entityDef, options );
    erFuncs.initEntityER( entityDef, options );
}

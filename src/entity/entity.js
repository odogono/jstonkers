var dlog = debug('entity');
// var erFuncs = require('./entity_relationship');
// exports.schema = 'urn:schemas-opendoorgonorth:heroes:entity#';
// var EntityCollection = require('./entity_collection').EntityCollection;

var Entity = exports.Entity = Backbone.Model.extend({

    defaults:{
        status: jstonkers.Status.ACTIVE,
        // created_at:new Date(),
        // updated_at:new Date()
    },

    created_at: new Date(),
    updated_at: new Date(),

    // the number of times this entity has been referenced by
    // another entity
    refCount:0,

    initialize: function(){
        // listen to entity changes and update ref system accordingly
        this.on('change', function(self,options){
            var existing, previous;
            if( options && options.changes ){
                for( var attrName in options.changes ){
                    if( (existing = this.get(attrName)) ){
                        if( !_.isUndefined(existing.refCount) )
                            existing.refCount++;
                    }
                    
                    if( (previous = this.previous(attrName)) && previous != existing && previous.refCount )
                        previous.refCount--;
                }
            }
        });
    },

    /**
     * [setEntity description]
     * @param {[type]} type     [description]
     * @param {[type]} instance [description]
     * @param {[type]} options  [description]
     */
    setEntity: function( type, instance, options ){
        this.set( type, instance, options );
    },

    /**
     * [getEntityType description]
     * @return {[type]}
     */
    getEntityType: function(){
        return this.get('type');
    },


    // 
    // 
    // 
    triggerRelated: function(events){
        var entity, relatedMap = this.flatten();

        for(var id in relatedMap){
            entity = relatedMap[id];
            // log('triggering on ' + id );
            entity.trigger.apply(entity,arguments);
        }
        return this;
    },

    // 
    // 
    // 
    set: function(key, value, options) {
        var i, er, attrs, attr, val,entity,subEntity;
        var self = this, entityDef;
        var EntityCollection = require('./entity_collection').EntityCollection;

        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

        // print_ins( attrs );
        if( attrs.type ){
            // log('setting type to ' + attrs.type );
            this.type = attrs.type;
        }

        options = options || {};

        if( options.setRelated ){
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

        // if( options && options.debug ) log('set ' + JSON.stringify(attrs));
        // log('set ' + JSON.stringify(attrs));

        // if( this.id ) 
        // log('setting ' + this.id + ' ' + JSON.stringify(entityDef) );

        // print_ins( attrs );
        if( entityDef && entityDef.ER ){
            for( i in entityDef.ER ){
                er = entityDef.ER[i];

                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                var erData = attrs[erName];

                var existing = this.attributes[erName];

                // remove inverse relationship on existing value if it exists
                if( er.inverse && existing ){
                    existing.set( er.inverse, null );
                }

                if( !erData ){
                    continue;
                }

                if( er.oneToOne ){
                    // log( this.type + ' set ' + JSON.stringify(erData) + ' ' + erName);
                    if(!(erData instanceof Entity)){
                        // TODO AV : could maybe get this model reference from elsewhere?
                        // log('setting ' + JSON.stringify(er) + ' as ' + erName + ' to ' + JSON.stringify(erData) + ' on ' + this.type );

                        try{
                            if( er.inverse )
                                erData[ er.inverse ] = this;
                            subEntity = exports.create( er.oneToOne, erData );
                            // log('all right');
                        } catch( e ){
                            if( options.debug ) log('failed creating with ' + JSON.stringify(erData) + ' ' + JSON.stringify(options) );
                            // print_stack();
                            // log('no good ' + e );
                        }
                        if( subEntity ) {
                            attrs[erName] = subEntity;
                            subEntity.refCount++;
                        } else
                            delete attrs[erName];
                    } else {
                        if( er.inverse )
                            erData.set( er.inverse, this );
                    }
                }
                else if( er.oneToMany && !(erData instanceof EntityCollection)){
                    if( !self[erName] ){
                        // log('no existing EntityCollection for ' + erName );
                        // self[erName] = jstonkers.entity.createEntityCollection();
                    }
                    if( self[erName] ){
                        // if( options.trueDebug ) log('~setting ' + erName + ' ' + JSON.stringify(erData) );
                        self[erName].set( erData );
                    }

                    delete attrs[erName];
                }
                else{
                    
                    // print_ins( erData );
                }
            }
        }

        var result = Backbone.Model.prototype.set.apply( this, arguments );
        return result;
    },//*/

    // 
    // 
    // 
    parse: function(resp, xhr, options){
        if( !resp )
            return resp;
        var i, er, key, self = this,
            targetId = this.id,
            origResp = resp;
        var debug = options && options.debug;
        // var removeId = options && !_.isUndefined(options.removeId) ? options.removeId : false;
        var removeId = options && options.removeId;

        if( options && options.parseFor ){
            targetId = options.parseFor;
        }
        if( resp[targetId] ){
            resp = resp[targetId];
        } else if( !targetId ){
            // if( debug ) log('no target id for ' + JSON.stringify(resp) + ' ' + JSON.stringify(xhr) );
            // // print_ins(resp);
            // // choose the first key
            // for(targetId in resp)
            //     break;
            
            // resp = resp[targetId];
            // if(!targetId)
            //     return resp;
        }
        var entityDef = exports.ids[ resp.type || this.type ];

        var associateRelations = function(data, options){
            var i, er, erId, items, erName, entityDef;
            options = (options || {});

            if( !data )
                return;

            var type = data.type || options.type || self.type;

            if( !_.isUndefined(type) ) 
                data.type = type;

            if( !(entityDef = (options.entityDef || exports.ids[ type ])) )
                return;

            // if( debug ) log('calling it ' + type + ' ' + JSON.stringify(data) );
            if( removeId ){
                delete data['id'];
            }
            
            // if( options.debug ) print_var( data );
            // if( options.debug ) print_var( entityDef );

            if( options.isCollection ){
                // this part of data has been flagged as being a collection instance
                // it may contain attributes of its own, and will have a list of entity ids keyed to either
                // the collection name, or a generic 'items' name
                key = 'items';
                if( data[ entityDef.name ] )
                    key = entityDef.name;                

                if( data[ key ] ){
                    data.items = _.map( data[ key ], function(item){
                        item = _.isObject(item) ? item : origResp[item];
                        return associateRelations( item );
                    });
                    if( data[ entityDef.name ] )
                        delete data[ entityDef.name ];
                }
                delete data.type;
                return data;
            }

            if( entityDef.oneToMany ){
                // TODO - maybe this should be the responsibility of the particular class...
                if( data.items ){
                    data.items = _.map( data.items, function(item){
                        item = _.isObject(item) ? item : origResp[item];
                        return associateRelations( item );
                    });
                }
            }

            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                erId = data[erName];

                if( er.oneToOne ){
                    // if( debug ) log('considering ' + erName + ' ' + erId );
                    if( origResp[erId] ){
                        // if( debug ) log('calling it ' + erId + ' ' + JSON.stringify(origResp[erId]) );
                        data[erName] = associateRelations( origResp[erId] );
                    } else if( _.isObject(erId) ) {
                        data[erName] = associateRelations( erId );
                    }
                }
                else if( er.oneToMany && erId ){
                    if( _.isArray(erId) ){
                        // the items will either be an array of entity ids, or entities themselves
                        items = _.map( erId, function(item){
                            item = _.isObject(item) ? item : origResp[item];
                            return associateRelations( item, {type:er.oneToMany} );
                        });
                        data[erName] = { items:items };
                    } else{
                        if( origResp[erId] ){
                            // log('assoc ' + JSON.stringify(er) );
                            data[ erName ] = associateRelations( origResp[erId], {isCollection:true,entityDef:er,debug:true} );
                        }
                        else if( erId.items ){
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
            // log('parsing');
            // print_ins( resp );
        // }
        
        return resp;
    },

    /**
     * Removes IDs from the entity and all contained
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
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
            return this;
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
        return this;
    },

    /**
     * Tests equality between this instance and another
     * @param  {[type]} other [description]
     * @return {boolean}       true if equal
     */
    equals: function(other){
        var tn = this.isNew(), on = other.isNew();
        if( tn !== on )
            return false;
        if( tn && on )
            return this.cid === other.cid;
        return this.id === other.id;
    },

    /**
     * Returns a clone of this instance
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    clone: function(options) {
        options = options || {};
        var recurse = _.isUndefined(options.recurse) ? false : options.recurse;

        var flattenOptions = {toJSON:true, recurse:false, relations:false};
        if( recurse ){
            flattenOptions.recurse = true;
            flattenOptions.relations = true;
        }

        var flat = this.flatten(flattenOptions);
        // if( options.debug ) print_var( flat );
        var parsed = this.parse( flat, null, {parseFor:this.id, removeId:true, debug:options.debug} );
        var result = new this.constructor( parsed );
        return result;
    },

    // 
    // 
    // 
    toJSON: function( options ){
        var i, entityDef, er, erName, relation, output;
        options || (options = {});
        var doRelations = _.isUndefined(options.relations) ? true : options.relations;//options.relations;
        var relationsAsId = options.relationsAsId;
        var returnDefaults = options.returnDefaults;
        var exclusions = options.exclude;
        
        // clone the attributes into the result objects
        // log('toJSON ' + this.id );
        var attrs = this.attributes, result = {};
        for (var prop in attrs) {
            if( prop.charAt(0) === '_' )
                continue;
            // don't serialise inverse relations
            if( prop == options.inverseKey )
                continue;
                // log('oh no! ' + JSON.stringify(options) );
            // TODO - rewrite ER checking inside this loop
            relation = attrs[prop];

            if( relation instanceof exports.Entity ){
                // if( options.debug )log('checking ' + relation.id + ' for exclude');
                if( !(exclusions && relation.match(exclusions)) ){
                    if( !relation.isNew() && relationsAsId )
                        result[prop] = relation.id;
                    else if( doRelations ){
                        // if( options.debug ) log('resulting ' + prop );
                        result[prop] = relationsAsId ? relation.id : relation.toJSON();
                    }
                }
            }
            else
                result[prop] = relation;
        }

        // if( options.debug ) log('entity.toJSON ' + this.cid );
        
        if( this.type ){
            entityDef = exports.ids[this.type];
            // if( debug ) log( this.type + ' relations: ' + JSON.stringify(entityDef) );

            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                // def = jstonkers.entity.ids[ er.type ];
                // if( options.debug ) log('entity.toJSON: ' + erName + ' ' + JSON.stringify(er) );

                // if( er.oneToOne ){
                // } else if( er.oneToMany ){
                if( er.oneToMany ){
                    relation = this[erName];
                    // 
                    if( !relation )
                        continue;
                    if( exclusions && relation.match(exclusions) ){
                        // if( options.debug )log('no hoopy ' + erName + ' ' + JSON.stringify(exclusions) );
                        continue;
                    }
                    // if( options.debug )log('hoopy ' + erName + ' ' + JSON.stringify(exclusions) );
                    if( !relation.isNew() && relationsAsId )
                        result[erName] = relation.id;// || this[erName].cid;
                    else if( doRelations ) {
                        // log('pre... ' + relation.cid);
                        if( (output = relation.toJSON()) ){
                            // log('export ' + erName + ' ' +  output);
                            result[erName] = output;
                        }
                    }
                }
            }
        }

        if( !returnDefaults ){
            _.each( this.defaults, function(val,key){
                // log('look ' + key + ' ' + result );
                if( result[key] === val )
                    delete result[key];
            });
        }

        if( options.noDates ){
            delete result.created_at;
            delete result.updated_at;
        }

        if( options.refCount )
            result.refCount = this.refCount;

        if( !_.isUndefined(this.type) )
            result.type = this.type;
        else
            delete result.type;

        return result;
    },

    // returns true if this entity has attributes which are non-default
    hasNonDefaultAttributes: function(options){
        var i,len,defaults = this.defaults;

        if( _.keys(this.attributes).length !== _.keys(this.defaults).length ){
            return true;
        }

        for( i=0,len=defaults.length;i<len;i++ ){
            if( defaults[i] !== this.attributes[ i ] )
                return true;
        }

        return false;
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

        // this option can 
        var maxRefCount = options.ownedOnly ? 1 : Number.MAX_VALUE;
        // recursing through found relations is the default
        var doRecurse = _.isUndefined(options.recurse) ? true : options.recurse;
        // exporting relation references is the default
        var doRelations = _.isUndefined(options.relations) ? true : options.relations;

        // exclusion options
        var exclusions = options.exclude;
        // var debug = options.debug;

        var toJsonOptions = _.extend({relationsAsId:true}, options);
        

        if( !result[id] ){
            if( options.toJSON ){
                result[id] = outgoing = this.toJSON(toJsonOptions);
                
                outgoing['type'] = this.type;
                if( this.id )
                    outgoing['id'] = this.id;
                else
                    outgoing['_cid'] = this.cid;

            }else
                result[id] = outgoing = this;


            var entityDef = exports.ids[this.type];

            var o2oNames = {};
            var o2mNames = {};

            for( i in entityDef.ER ){
                er = entityDef.ER[i];
                // def = jstonkers.entity.ids[ er.type ];
                // if( options.debug ) log('exam ER ' + JSON.stringify(entityDef) + ' -> ' + JSON.stringify(er) );
                // print_ins( jstonkers.entity.ids );
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                
                if( er.oneToOne ){
                    if( doRecurse && (child = this.get(erName)) && child.refCount <= maxRefCount ){
                        // if( debug ) log('1 ' + child.id + ' ' + JSON.stringify(exclusions) );
                        if( !(exclusions && child.match(exclusions)) )
                            child.flatten( options );
                        // if( debug ) log('child refCount: ' + child.refCount + '/' + maxRefCount );
                        // if( debug ) log('child ' + child.type );
                            
                    }
                } else if( er.oneToMany && (child=this[erName]) ){

                    if( !(exclusions && child.match(exclusions)) ){
                        // if( options.debug ) log('exam ER ' + JSON.stringify(entityDef) + ' -> ' + JSON.stringify(er) );
                        if( doRecurse ) {//&& (child = this[erName]) ){
                            // print_ins( child instanceof jstonkers.entity.EntityCollection );
                            // log( child.flatten )
                            // log( child instanceof exports.Entity );
                            // print_ins( child );
                            child.flatten(options);
                        }
                        
                        if( options.toJSON && options.referenceItems ){
                            // if( options.debug ) log('flattening ' + erName );

                            if( child.shouldSerialise() || child.length < 0 )
                                outgoing[erName] = child.id || child.cid;
                            else // if( this[erName].length > 0 )
                                outgoing[erName] = child.toJSON( {collectionAsIdList:true} );
                            // else
                                // outgoing[erName] = this[erName].id || this[erName].cid;
                        }
                    }
                }
            }

            // look through attributes for entities that should be flattened as well
            for( i in this.attributes ){
                child = this.attributes[i];
                if( child instanceof exports.Entity ){
                    
                    if( options.allEntities && doRecurse )
                        // if( debug ) log('2 ' + child.id );
                        // if( !(exclusions && child.match(exclusions,{debug:true})) ){
                        {
                            // if( debug ) log('2 including ' + child.id );
                            child.flatten(options);

                            if( options.toJSON ){
                                if( doRelations ){
                                    // if(options.debug)log('flatten to id ' + child.id );
                                    outgoing[i] = child.id || child.cid;
                                }else
                                    delete outgoing[i];
                            }
                        }
                    
                }
            }

        }
        return result;
    },

    /**
     * Tests the entity against cases to check for
     * some kind of equality
     * @param  {Array|Object} cases   [description]
     * @param  {Object} options [description]
     * @return {boolean}         returns true if any of the cases apply
     */
    match: function( cases, options ){
        var i, p, kase, self = this;
        if( !cases )
            return false;
        options = options || {};
        if( !_.isArray(cases) )
            cases = [ cases ];

        for( i in cases ){
            kase = cases[i];
            if( _.isObject(kase) ){
                for( p in kase ){
                    if( p === 'type' && this.getEntityType() == kase[p] )
                        return true;
                    if( self[p] && self[p] === kase[p] ){
                        // if( options.debug ) log('matching with ' + JSON.stringify(this) + ' ' + JSON.stringify(kase) );
                        return true;
                    }
                }
            }
        }

        return false;
    }

});


// exports.Entity = Entity;

exports.isEntity = function( obj ){
    return _.isObject(obj) && entity.__super__;
}


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
    var collectionName, props;
    var debug = options && options.debug;

    // TODO - this is a super-hateful mess, refactor

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
    else if( attrs ) {
        if( !_.isObject(attrs) )
            attrs = { id:attrs };
    }else{
        attrs = (attrs || {});
    }


    if( _.isObject(type) ){
        if( type.type )
            type = type.type;
    }
    else {
        if( _.isString(type) && type.indexOf('.') != -1 ){
            attrs.id = type;
            type = type.substring( 0, type.indexOf('.') );
        }
    }

    if( type === undefined ){
        throw new Error('undefined type' );
    }

    // look for ER properties
    var entityDef = exports.ids[type];
    var erProperties = {};

    if( entityDef === undefined )
        throw new Error(type + ' not found');

    
    // if there are any ER properties in the attrs, take them out
    // for application later on
    for( i in entityDef.ER ){
        er = entityDef.ER[i];
    // _.each( entityDef.ER, function(er){
        if( er.oneToMany ){
            collectionName = (er.name || er.oneToMany).toLowerCase();
            // log('consider ' + collectionName );
            if( attrs[collectionName] ){
                erProperties[collectionName] = {attrs:attrs[collectionName], type:er.oneToMany, inverse:(er.inverse||type)};
                delete attrs[collectionName];
            }
        }
    }



    // if( entityDef.create ){
        // result = entityDef.create( attrs, options );
    // }else{
    // if( options && options.debug ) {
    //     log('creating with ' + JSON.stringify(attrs) + ' ' + type );
    //     print_ins( entityDef );
    // }
        // if( attrs.debug ) log( entityDef.entity );
    result = new entityDef.entity( attrs, options );
        // if( attrs.debug ) print_ins( result );
        // if( options && options.debug ) print_ins( result );
    // }
    result.type = type;
    result.refCount = 0;
    
    // apply any sub properties that were found earlier
    for( collectionName in erProperties ){
        props = erProperties[collectionName];
    // _.each( erProperties, function(props,collectionName){
        var setFn = 'set' + _.capitalize(collectionName); 
        if( result[setFn] ){
            result[setFn]( props.attrs, props );
        }
        else if( result[collectionName] ){
            result[collectionName].set( props.attrs, props );
        }
    }
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


exports.unregisterEntity = function(){

}

/**
*   Registers a new entity type 
*   - the incoming object must have a type and entity field
*/
exports.registerEntity = function( entityDef, entity, options ){
    dlog('registering entity ' + JSON.stringify(entityDef) );
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
        var entityType = entityDef;
        // attempt to load
        if( entityDef.indexOf('./') !== 0 )
            entityDef = './' + entityDef;
        entityDef = require(entityDef);
        entityDef.type = entityDef.type || entityType;
    }


    // check whether this entity is already registered 
    if( exports.ids[entityDef.type] ){
        return exports.ids[entityDef.type];
    }

    registerEntityType( entityDef, options );
    return entityDef;
}

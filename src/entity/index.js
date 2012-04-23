module.exports.ids = {};
module.exports.names = {};

exports.entities = {
    Entity: require('./entity'),
    // Actor: require('./actor'),
    Game: require('./game'),
    Map: require('./map'),
    Team: require('./team'),
    User: require('./user'),
    Order: require('./order'),
    Unit: require('./unit'),
    // Poi: require('./poi'),
    // World: require('./world'),
    // Mailbox: require('./mailbox'),
    // Mail: require('./mail'),
    // Scene: require('./scene'),
};

_.extend(module.exports, exports.entities);

// base entity class
module.exports.Base = module.exports.Entity.entity;

module.exports.EntityCollection = require('./entity_collection').entity;
module.exports.createEntityCollection = require('./entity_collection').create;

// general creation function
module.exports.create = module.exports.Entity.create;

module.exports.Factory = require('./factory');
module.exports.toJSON = module.exports.Factory.toJSON;
module.exports.createFromJSON = module.exports.Factory.createFromJSON;

// merge in the erm functions into this namespace
var erFuncs = require('./entity_relationship')
_.extend(module.exports, erFuncs );


// normalises the type of an entity
exports.getEntityFromType = function( type ){
    if( type === null || type === undefined )
        return null;
    if( _.isObject(type) && type.type )
        type = type.type;
    if( !_.isString(type) )
        return null;
    if( module.exports.ids[type.toLowerCase()] ){
        return module.exports.ids[type.toLowerCase()];
    }
    if( module.exports[type.toUpperCase()] ){
        return module.exports[type.toUpperCase()];
    }
    if( module.exports['TYPE_' + type.toUpperCase()] ){
        return  module.exports.ids[module.exports['TYPE_' + type.toUpperCase()]];
    }
    // look for schema

    return null;
}

// returns entity relationship details for a given type
exports.getER = function( type ){
    type = exports.getEntityFromType( type );
    return type.ER;
}


function registerEntityType( entityDef ){
    var schema;
    if( entityDef.schema ){
        // log('schema found for ' + entityDef.schema );//+ ' ' + inspect(entityDef) );
        
        // schema = Common.schema.getSchemaValue( entityDef.schema );
        var schemaValue = Common.schema.getSchemaValue( entityDef.schema );
        // print_ins( schemaValue, false, 2 );
        entityDef.type = schemaValue.id.substring(1);
        entityDef.name = (schemaValue.properties.name) ? schemaValue.properties.name : entityDef.type;
        if( schemaValue.er ){
            entityDef.ER = schemaValue.er;
        }
        // print_ins( schemaValue );
        // log( JSON.stringify(jsonpointer.get(schemaValue, '/er'),null,'\t') );
    }
    else{
        entityDef.name = entityDef.name || entityDef.type;
    }
    
    if( !entityDef.type ){
        return;
    }

    if( !entityDef.entity ){
        entityDef.entity = module.exports.Base.extend({});
    }

    if( !entityDef.ER )
        entityDef.ER = [];

    var name = _.capitalize(entityDef.name) || _.capitalize( entityDef.type );

    // add to entities
    module.exports[name] = exports.entities[name] = entityDef;
    
    module.exports.ids[entityDef.type] = entityDef;
    module.exports.names[entityDef.type] = name;
    module.exports['TYPE_' + name.toUpperCase()] = entityDef.type;
}


//  set up and register entity types
_.each( exports.entities, function(entity,name){
    registerEntityType( entity );
});

// run post module initialisation entity relationship setup
// TODO : must be a better way
_.each( exports.entities, function(entity,name){
    erFuncs.initEntityER(entity, {debug:false});
});

/**
*   Registers a new entity type 
*   - the incoming object must have a type and entity field
*/
exports.registerEntity = function( entityDef, options ){
    registerEntityType( entityDef );
    erFuncs.initEntityER( entityDef, options );
}

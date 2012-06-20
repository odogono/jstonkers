var entity = require('./entity');
var EntityCollection = require('./entity_collection');
// module.exports.createEntityCollection = require('./entity_collection').create;


var oldRegisterEntity = entity.registerEntity;
entity.registerEntity = function( entityDef, entity, options ){
    entityDef = oldRegisterEntity.apply(this,arguments);
    initEntityER( entityDef, options );
    return entityDef;
};


exports.getERDetails = function( erName ){
    var entry;
    var entityDef = exports.ids[this.type];
    if( !entityDef )
        return null;

    for( var i in entityDef.ER ){
        entry = entityDef.ER[i];
        if( entry.name === erName || entry.type === erName )
            return entry;
    }
    return null;
};

var initEntityER = function( entityDef, options ){
    options = (options || {});
    // the ER spec matches the key to a TYPE string - string because the types usually
    // aren't set up at the time of creation
    // var getEntityFromType = module.parent.exports.getEntityFromType;

    // var debug = entityDef === 'game_manager';
    // if( debug ) log('initEntityER');
    // if( Common.debug ) options.debug = true;
    // if( entityDef.type === 'user' ) options.debug = true;
    // log('initialising ER for ' + entityDef.type );

    function resolveEntity( entityId ){
        var result = {};
        /*var refEntity = Common.schema.getSchemaValue( entityId, entityDef.schema, true );

        // print_var(entityDef);
        if( refEntity ){
            result.type = refEntity.id.substring(1);
            result.name = result.type;
            try{
                result.name = jsonpointer.get( refEntity, '/properties/name');
            }catch(err){}
            return result;
        }//*/

        // resort to looking up entity from entity registry
        result = entity.getEntityFromType(entityId);
        if( result ){
            result = _.clone( result );
            result.name = result.name || result.type;
        }
        // if( entityDef.type === 'o2m' ) log('looking up ' + entityId );
        // if( entityDef.type === 'o2m' ) log( 'oh hia ' + inspect(refEntity) );
        // if( refEntity ){
            // result.type = refEntity.type;
            // result.name = refEntity.name || refEntity.type;

            // result.other = refEntity;
            // if( refEntity.name ) 
                // result.name = refEntity.name;
            // return result;
        // }
        return result;    
    }

    _.each( entityDef.ER, function(spec){
        var refEntity,details;
        // if( debug ) log('examining ' + inspect(spec) );
        if( spec.oneToMany ){
            refEntity = resolveEntity( spec.oneToMany );
            if( refEntity ){
                spec.type = refEntity.type;
                spec.name = spec.name || refEntity.type;
            }
            // else{
            // log('found entity ' + spec.oneToMany + inspect(spec) );
            // }
            // print_ins( refEntity );
            // if( entityDef.type === 'o2m' ) print_ins( spec );
            // if( entityDef.type === 'o2m' ) log( 'regER ' + inspect(entityDef.ER) );
            // spec = _.extend( spec,  );
            // refEntity = resolveEntity( spec.oneToMany );
            // spec.type = spec.type || refEntity.type;
            // if( entityDef.type === 'o2m' ) log( 'regER ' + inspect(entityDef.ER) );
            module.exports.oneToMany( entityDef, spec, options );
        }
        if( spec.oneToOne ){
            refEntity = resolveEntity( spec.oneToOne );
            if( refEntity ){
                spec.type = refEntity.type;
                spec.name = spec.name || refEntity.type;
            }
            // spec = _.extend( spec, resolveEntity( spec.oneToOne ) );
            module.exports.oneToOne( entityDef, spec.type );
        }

        if( spec.type ){
            refEntity = resolveEntity( spec.type );
            if( !refEntity )
                throw new Error('entity ' + spec.type + ' not defined');
            if( refEntity ){
                spec.name = refEntity.name = spec.name || refEntity.type;
            } 
            if( refEntity.oneToMany ){
                spec.oneToMany = true;
                module.exports.oneToMany( entityDef, refEntity, options );
            }
            // log( 'using ');
            // print_ins( refEntity );
        }
    });

    // if( options.oneToMany ){
    //     log('requested as o2m');
    // }
}

exports.oneToOne = function( entityDef, codomainType, options ){
    if( codomainType === undefined || entityDef === undefined )
        return;
    var debug = options && options.debug,
        codomainName = _.capitalize(entity.names[codomainType]);

    // log( 'applying 1to1 from ' + entityDef.type + ' to ' + codomainType );

    // entityDef.entity.prototype[ 'set' + codomainName ] = function( otherEntity, options ){
    //     this.set( '_'+codomainType, otherEntity, options );
    // };

    // entityDef.entity.prototype[ 'get' + codomainName ] = function(){
    //     return this.get('_'+codomainType);
    // };
}


exports.oneToMany = function( entityDef, spec, options ){
    if( !spec  || !spec.type || entityDef === undefined )
        return;
    var debug = options && options.debug,
        codomainType = spec.type,
        domain = entityDef.entity,
        codomainName = _.capitalize( spec.name || entity.names[spec.type]),
        codomainNameLower = codomainName.toLowerCase();

    debug = entityDef.type === 'o2m';
    // log( '1tom ' + entityDef.type );
    // if( debug )log('applying 1toM on ' + entityDef.type + ' to ' + JSON.stringify(spec) );

    // create the oneToOne on the codomain - this means it now has set and get methods
    exports.oneToOne( entity.ids[ spec.type ], entityDef.type, options );
    
    // override existing initialize to create a collection
    var existingInitialize = entityDef.entity.prototype.initialize;
    // if( entityDef.type === 'game' ) {
    //     print_ins( entityDef.entity.prototype );
    //     log( entityDef.entity.prototype.initialize );
    //     throw new Error();
    // }
    // print_stack();

    // provide a new initialisation function which allows the collection to 
    // be instantiated
    entityDef.entity.prototype.initialize = function(){
        // log('initialize ' + entityDef.type);
        // log('oh:');
        // print_ins( spec );
        // if( debug ) log( entityDef );
        // log('creating with ' + spec.create );
        var self = this,
            entityName = codomainName.toLowerCase(),
            // collection = 
            collection = spec.create ? spec.create({entity:codomainType}) : EntityCollection.create({entity:codomainType});

        // print_ins( module.parent.exports.getEntityFromType(codomainType) );
        // collection.model = module.parent.exports.getEntityFromType(codomainType).entity;
        // collection.entity = this;
        // log('set name on collection to ' + codomainType);
        var collectionName = entityName != codomainType ? entityName : codomainType;
        var childRelationKey = '_'+ entityDef.type+':'+collectionName;
        // log('adding ' + JSON.stringify({name:collectionName, entity:self.id}) );
        // collection.set( {name:collectionName, entity:self.id} );
        
        // a reference from the collection to its owning entity
        collection.owner = this;
        collection.name = collectionName;
        // log('initialised collection ' + collectionName );

        this[ codomainNameLower ] = collection;
        // if( debug ) log('added collection .' + codomainNameLower);
        // if( debug ) log( entityDef.type + ' calling existing initialize');
        // if( entityDef.type === 'game' ) log( existingInitialize );
        

        // add listeners for add and remove
        /*collection.on('add', function(childEntity){
            childEntity.refCount++;
            // childEntity.set(childRelationKey, self);
        }).on('remove', function(childEntity){
            childEntity.refCount--;
            // childEntity.set(childRelationKey, undefined);
        }).on('reset', function(){
            log('resetting...');
            print_ins( arguments );
        });//*/

        existingInitialize.apply(this, arguments);
    }

    // if( options.debug ) log( entityDef.entity.prototype.initialize );
}

exports.addEntityToEntity = function( childEntity, parentEntity, specifier ){
    var entity = module.parent.exports,
        ers = entity.ids[parentEntity.type].ER;
    // log('adding ' + childEntity.id + ' to ' + parentEntity.id + ' using ' + specifier);

    // look for the first relationship in the parent that we can add the child to
    _.each( ers, function(er){
        if( er.type == childEntity.type ){
            if( er.oneToOne )
                parentEntity[ '_' + er.name ] = childEntity;
            else if( er.oneToMany ){
                // log( parentEntity.id + ' adding to collection ' + inspect(er) );
                parentEntity[ er.name ].add( childEntity, {silent:true} )
            }
        }
    });

    // print_ins(entity.ids[parentEntity.type].ER);
}
// exports.schema = 'urn:schemas-opendoorgonorth:heroes:entity#';

var Entity = Backbone.Model.extend({
    defaults:{
        created_at:new Date(),
        updated_at:new Date()
    },

    initialize: function(){
        this.set( 'status', Common.Status.INACTIVE );
        // log('initialize ' + this.id + ' ' + this.type );
    },

    setEntity: function( type, instance, options ){
        this.set( type, instance, options );
    },

    parse: function(resp, xhr){
        if( !resp )
            return resp;
        
        var self = this,
            entityDef = Common.entity.ids[this.type];

        // set any ER properties

        _.each( entityDef.ER, function(er){
            var collectionName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();;
            var collection = self[collectionName];

            if( resp[collectionName] && collection ){
                // log('setting properties for ' + collectionName + ' ' + JSON.stringify(resp[collectionName]) );
                collection.set( collection.parse(resp[collectionName]) );
                delete resp[collectionName];
            }
        });
        

        // print_ins( this );

        return resp;
    },

    /*
    toJSON: function( options ){
        options || (options = {});
        // var result = this.constructor.__super__.toJSON.call(this);
        // log('hey calling');
        // result.pink = true;
        return {};
    },//*/

});


exports.entity = Entity;




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
    var result;
    var debug = options && options.debug;
    
    if( _.isObject(type) && _.isObject(attrs) && type.type ){
        type = type.type;
    }
    else if( _.isObject(type) ){
        options = attrs;
        attrs = type;
        type = attrs.type;
        if( !type && attrs.id && attrs.id.indexOf('.') > 0 )
            type = attrs.id.substring( 0, attrs.id.indexOf('.') );
    }
    else if( _.isString(attrs) )
        attrs = { id:attrs };
    else 
        attrs = (attrs || {});

    attrs.created_at = new Date();
    attrs.updated_at = new Date();

    if( _.isObject(type) && type instanceof Backbone.Model && type.type ){
        // attrs.id = type.type + '.' + uuid();
        type = type.type;
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
        throw new Error('undefined type');
    }

    // if( attrs.id.indexOf(type) !== 0 )
        // attrs.id = type + '.' + attrs.id;

    // look for ER properties
    var entityDef = Common.entity.ids[type];
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

    if( entityDef.create ){
        result = entityDef.create( attrs, options );
    }else{
        result = new entityDef.entity( attrs, options );
    }
    result.type = type;
    

    // apply any sub properties that were found earlier
    _.each( erProperties, function(props,collectionName){
        var setFn = 'set' + _.capitalize(collectionName); 
        if( result[setFn] ){
            result[setFn]( props );
        }
        else if( result[collectionName] ){
            result[collectionName].set( props );
            // if( debug ) log( collectionName );
            // if( debug ) print_ins( props );
        }
    });
    return result;
};


// exports.retrieveById = function( id, options ){
//     var storageOptions = {},
//         successCallback = options.success,
//         errorCallback = options.error;
//     // the id will be the initial chars
//     var entityType = id.substring( 0, id.indexOf('.') );
//     var result = Common.entity.ids[ entityType ].create({id:id});
    
//     storageOptions.db = Common.config.mongodb.default_db;
//     storageOptions.collection = Common.config.mongodb.collections[ entityType ] || Common.config.mongodb.collections.entity;

//     Common.storage.readRecord( id, storageOptions, function(err,doc){
//         if( doc ){
//             result.set( result.parse(doc), {silent:true} );
//             successCallback( result );
//         } else {
//             if( options.debug ) log('returning null for ' + model.id );
//             errorCallback( err );
//         }
//     });    
// };


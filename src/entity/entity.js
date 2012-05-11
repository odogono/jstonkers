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



    // converts a single callback function into something backbone compatible 
    convertCallback: function(options,callback){
        options || (options={});
        if( _.isFunction(options) ){
            callback = options;
            options = {};
        }
        if( callback ){
            options = _.extend(options,{
                success: function(model,resp){
                    callback( null, model, resp );
                },
                error: function(model,err,resp){
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

        if( _.isObject(key) || key == null){
            attrs = key;
            callback = options;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        options = this.convertCallback( options, callback );
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


    set: function(key, value, options) {
        var attrs, attr, val;
        var self = this,
            entityDef = Common.entity.ids[this.type];

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }

        if( entityDef && entityDef.ER ){
            // log('setting ' + JSON.stringify(attrs) );
            _.each( entityDef.ER, function(er){
                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                var erData = attrs[erName];

                if( er.oneToOne && erData && !(erData instanceof Common.entity.Base) ){
                    // TODO AV : could maybe get this model reference from elsewhere?
                    var subEntity = Common.entity.create( erData );
                    if( subEntity ) {
                        attrs[erName] = subEntity;
                    } else
                        delete attrs[erName];
                }
            });
        }

        // var result = this.constructor.__super__.set.call(this,key,value,options);
        // var result = Backbone.Model.prototype.set.call(this,key,value,options);
        var result = Backbone.Model.prototype.set.apply( this, arguments );
        return result;
    },//*/

    parse: function(resp, xhr){
        if( !resp )
            return resp;
        
        var self = this,
            origResp = resp,
            entityDef = Common.entity.ids[this.type];

        if( resp[this.id] ){
            // log('parsing from a map');
            resp = resp[this.id];
            // print_ins( resp );
        }
        else{
            // log('nope ' + this.id);
        }

        // set any ER properties
        if( resp !== this ){
            _.each( entityDef.ER, function(er){
                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                // var collection = self[erName];

                if( er.oneToOne ){
                    var erId = resp[erName];
                    // log('looking for ' + erId );
                    // print_ins( origResp );

                    if( origResp[erId] ){
                        resp[erName] = origResp[erId];
                        // log('got it');
                    }
                }
                // print_ins( resp );
                // log('hey! ' + erName + ' ' + resp[erName] + ' ' + collection);

                // if( er.oneToOne && origResp[resp[erName]] ){
                //     resp[erName] =  origResp[ resp[erName] ];
                // }

                // if( resp[erName] && collection ){
                    // log('setting properties for ' + erName + ' ' + JSON.stringify(resp[erName]) );
                    // collection.set( collection.parse(resp[erName]) );
                    // delete resp[erName];
                // }
            });//*/
        }
        
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
    else if( attrs ) { //_.isString(attrs) ){
        if( !_.isObject(attrs) )
            attrs = { id:attrs };
    }else{
        attrs = (attrs || {});
    }

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
        throw new Error('undefined type' );
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
        }
    });
    return result;
};
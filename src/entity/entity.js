// exports.schema = 'urn:schemas-opendoorgonorth:heroes:entity#';

var Entity = Backbone.Model.extend({
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
        var attrs, attr, val,entity;
        var self = this, entityDef;

        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

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

        // log('hey but ' + this.cid );
        // print_var( attrs );

        entityDef = Common.entity.ids[this.type || attrs.type];

        // if( options && options.setRelated ) log('set ' + JSON.stringify(attrs));

        if( entityDef && entityDef.ER ){
            _.each( entityDef.ER, function(er){
                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();
                var erData = attrs[erName];

                // if( options && options.setRelated ) log('set ' + JSON.stringify(attrs) + ' ' + erName);

                if( !erData )
                    return;

                if( er.oneToOne ){

                    // if( options && options.debug ) log('set ' + JSON.stringify(attrs));
                    // if( options && options.debug ) print_ins( erData );
                    // if( options && options.debug ) log( erData instanceof Common.entity.Base );

                    if(!(erData instanceof Common.entity.Base)){
                        // if( options && options.debug ) log('eh wot');
                        // TODO AV : could maybe get this model reference from elsewhere?
                        var subEntity = Common.entity.create( erData );
                        if( subEntity ) {
                            attrs[erName] = subEntity;
                        } else
                            delete attrs[erName];
                    }/* else if( options && options.setRelated ){
                        log('what');
                        erData.set.call(erData, arguments);
                        // log('here!');
                        // print_var( erData );
                    }//*/
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

    parse: function(resp, xhr){
        if( !resp )
            return resp;
        
        var self = this,
            origResp = resp,
            entityDef = Common.entity.ids[this.type];

        if( resp[this.id] ){
            resp = resp[this.id];
        } 
        
        // set any ER properties
        if( resp !== this ){
            _.each( entityDef.ER, function(er){
                var erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();

                if( er.oneToOne ){
                    var erId = resp[erName];
                    if( origResp[erId] ){
                        resp[erName] = origResp[erId];
                    }
                }
                else if( er.oneToMany ){
                    if( origResp[erName] ){
                        resp[erName] = origResp[erName];
                    }
                }
            });
        }
        
        return resp;
    },


    // flattens this instance to a map of entity ids entities
    flatten: function( options ){
        var er, erName,child
        options = options || {};
        var result = options.result = (options.result || {});
        var id = this.id || this.cid;

        if( !result[id] ){
            result[id] = this;

            var entityDef = Common.entity.ids[this.type];

            for( var i in entityDef.ER ){
                er = entityDef.ER[i];
                erName = (er.name || er.oneToMany || er.oneToOne ).toLowerCase();

                if( er.oneToOne ){
                    if( (child = this.get(erName)) ){
                        child.flatten( options );
                    }
                }
            }

        }

        return result;
    }

});


exports.Entity = Entity;




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

    if( _.isObject(type) ){
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
        // if( options && options.debug ) log('creating with ' + JSON.stringify(attrs) );
        result = new entityDef.entity( attrs, options );
        // if( options && options.debug ) print_ins( result );
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
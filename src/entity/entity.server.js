// Server-side entity functions
var entity = require('./entity');

_.extend( entity.Entity.prototype, {
    storeKeys: function(){
        return [ 'created_at', 'updated_at' ];
    },

    
    // converts a single callback function into something backbone compatible 
    convertCallback: function(options,callback){
        // log('convertCallback ' + JSON.stringify(options ) );
        options || (options={});
        if( _.isFunction(options) ){
            callback = options;
            options = {};
        }
        // var debugit = options.debugB;
        if( callback ){
            options = _.extend(options,{
                success: function(model,resp){
                    callback( null, model, resp, options );
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
        if( arguments.length === 1 ){
            callback = key;
            options = {};
        }
        else if( _.isObject(key) || key == null){
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

    // 
    // 
    // 
    saveRelatedCB: function( options, callback){
        options = this.convertCallback( options, callback );
        options.saveRelated = true;
        return this.save( null, options );
    },

    // 
    // 
    // 
    fetchCB: function(options,callback){
        options = this.convertCallback( options, callback );
        return this.fetch( options );
    },

    // 
    // 
    // 
    fetchRelatedCB: function(options,callback){
        options = this.convertCallback( options, callback );
        options.fetchRelated = true;
        return this.fetch( options );
    },

    // 
    // 
    // 
    destroyCB:function(options,callback){
        options = this.convertCallback(options,callback);
        return this.destroy(options);
    },

    // 
    // 
    // 
    destroyRelatedCB: function( options,callback ){
        options = this.convertCallback(options,callback);
        options.destroyRelated = true;
        return this.destroy(options);  
    },
});
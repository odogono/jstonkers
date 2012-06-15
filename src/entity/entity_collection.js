var Entity = require('./entity');

exports.EntityCollection = Entity.Entity.extend({
    defaults:{
        // name: 'items',
        start: 0, // the starting index
        page: 1, // the current page index
        page_size: 10, // the number of items in each page
        item_count: 0, // the total number of items
        page_count: 0, // the number of 'pages'
        status:Common.Status.ACTIVE
    },

    initialize: function(){
        var self = this;

        if( !this.items ){
            this.items = new Backbone.Collection();
            this.items.entityCollection = this;
            // override default behaviour to create types of item
            this.items.model = this.createItemsModel;
            this.items.on('add', function(model){
                model.entityCollection = self;
            }).on('remove', function(model){
                model.entityCollection = null;
            }).on('all', function(){
                self.trigger.apply(self, arguments);
            });

            return true;
        }
        return false;
    },

    createItemsModel: function( attrs, options ){
        if( attrs.type ){
            return Entity.create( attrs, options );
        }
        return new Backbone.Model( attrs, options );
    },

    get: function(attr){
        if( attr == 'offset' )
            return this.get('page_size') * (this.get('page')-1);
        if( attr == 'item_count' )
            return Math.max( this.items.length, this.attributes.item_count );
        if( attr == 'page_count' )
            return Math.ceil( this.items.length / this.get('page_size') );
        return Entity.Entity.prototype.get.apply(this,arguments);
    },

    set: function(key, value, options) {
        var self=this, attrs, attr, val;
        if( key === this )
            return this;
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if( _.isArray(key) ){
            // setting collection values directly
            this.reset( key );
            return this;
            // log('setting array');
            // print_ins( key );
        }
        if( _.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

        if( attrs.items ){
            // log('set entC');
            this.reset( attrs.items );
            // print_ins( this.items.at(0).attributes );
            delete attrs.items;
        }

        var result = Entity.Entity.prototype.set.apply( this, arguments );
        return result;
    },

    // save: function(key, value, options) {
    //     var entities = this.flatten();
    //     Step(
    //         function(){
    //             var group = this.group();
    //             for( var id in entities ){
    //                 entities[id].save({success:function(){
    //                     group();
    //                 },error:function(){
    //                     group();
    //                 }});
    //             }
    //         },
    //         function(){

    //         }
    //     );
    // },

    
    
    // Prepare a model or hash of attributes to be added to this collection.
    /*_prepareModel: function(model, options) {
        log("YO");
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        log('overriden _prepareModel with ' + JSON.stringify(attrs) );
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },//*/

    parse: function(resp, xhr){
        if( resp === this )
            return resp;
        // print_ins( arguments );
        if( !this.items )
            this.initialize();
        if( resp.entity ){
            var entityDef = Common.entity.getEntityFromType( resp.entity );
            if( !entityDef )
                throw new Error('no entity found called ' + resp.entity );
            // log('hmm, nothing for ' + resp.entity );
            this.entityType = entityDef.type;
            // log('setting items model to ' + entityDef.type + ' ' + JSON.stringify(entityDef));
            // this.items.model = entityDef.entity;
            delete resp.entity;
        }
        if( resp.items ){
            this.reset( resp.items );
            delete resp.items;
        } else {
            // log('EntityCollection.parse:');
            resp = Entity.Entity.prototype.parse.apply( this, arguments );
            // print_ins( resp );
        }
        return resp;
    },

    reset: function( models,options ){
        var self = this;
        this.items.reset( models, options );
        this.items.each( function(i){
            if( i.type === undefined )
                i.type = self.entityType;
        });
    },
    
    flatten: function( options ){
        var id,item,i,len,outgoing;
        options = options || {};
        var result = options.result = (options.result || {});
        var id = this.id || this.cid;
        
        // log('flattening collection ' + id + ' with options ' + JSON.stringify(options) );

        if( options.toJSON ){
            outgoing = this.toJSON(_.extend(options,{referenceItems:true,includeCounts:false,returnDefaults:false}));

            if( this.type ) 
                outgoing['type'] = this.type;
            if( this.id )
                outgoing['id'] = this.id;
            else
                outgoing['_cid'] = this.cid;

            result[id] = outgoing;
        }else
            result[id] = outgoing = this;

        for( i=0,len=this.items.length;i<len;i++ ){
            item = this.items.at(i);
            item.flatten(options);
        }

        return result;
    },

    toJSON: function( options ){
        options || (options = {});
        var result,
            refItems = options.referenceItems,
            includeCounts = options.includeCounts,
            fullItems = options.fullItems,
            returnDefaults = options.returnDefaults;

        if( options.collectionAsIdList ){
            return this.items.map( function(it){ return it.id || it.cid });
        }

        result = Entity.Entity.prototype.toJSON.apply(this,arguments);

        if( includeCounts ){
            result.item_count = this.items.length;
            result.page_count = Math.ceil(result.item_count / result.page_size);
            // log('adding counts');
        } else {
            // delete result.item_count;
            // delete result.page_count;
        }

        if( this.items.length > 0 ){
            if( refItems )
                result.items = this.items.map( function(it){ return it.id || it.cid });
            else
                result.items = this.items.map( function(it){ return it.toJSON(options); });
        }

        
        return result;
    }
});

exports.EntityCollection.prototype.__defineGetter__('length', function(){
    return this.items.length;
});

// exports.EntityCollection.prototype.__defineSetter__('model', function(model){
//     // log('setting model to be ' + model.prototype );
//     // print_ins( model.prototype );
//     this.items.model = model;
// });
// exports.EntityCollection.prototype.__defineGetter__('model', function(){
//     return this.items.model;
// })

// mix in certain Backbone.Collection methods into our class
_.each( ['add', 'remove', 'at', 'each', 'map'], function(method){
    exports.EntityCollection.prototype[method] = function(){
        // log( method + ' ' + JSON.stringify(_.toArray(arguments)) );
        return this.items[method].apply( this.items, arguments );
    }    
});


exports.create = function( attrs, options ){
    options || (options = {});
    // this option has to be set in order to process any passed items/models
    // correctly
    options.parse = true;
    var result = new exports.EntityCollection( attrs, options );
    return result;
}
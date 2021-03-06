var entity = require('./entity');

// 
// Returns true if the supplied object is an EntityCollection instance
// 
exports.isEntityCollection = function( obj ){
    return obj && obj instanceof exports.EntityCollection;
}

// 
// Returns true if the supplied object is an EntityCollection container instance.
// A container has no identity of its own and is used primarily to fetch groups of
// entities using criteria contained within
// 
exports.isContainer = function( inst ){
    return inst && inst instanceof exports.EntityCollection && inst.isNew();
}

exports.EntityCollection = entity.Entity.extend({
    defaults:{
        // name: 'items',
        start: 0, // the starting index
        page: 1, // the current page index
        page_size: 10, // the number of items in each page
        item_count: 0, // the total number of items
        page_count: 0, // the number of 'pages'
        status:jstonkers.Status.ACTIVE
    },

    initialize: function(){
        var self = this;

        if( !this.items ){
            this.items = new Backbone.Collection();
            this.items.entityCollection = this;
            // override default behaviour to create types of item
            this.items.model = this.createItemsModel;
            
            // in order to handle resets and refCounts, we must override an internal function
            this.items._removeReference = this.removeReferenceFromItems;

            var onAdd = function(model){
                model.entityCollection = self;
                model.refCount++;
                // log('adding ' + model.id );
                // if( inverseKey ) model[inverseKey] = self.owner;
                if( self.inverseKey )
                    model.set( self.inverseKey, self.owner );
            };

            this.items.on('add', onAdd )
            .on('remove', function(model){
                model.set( self.inverseKey, null );
                model.entityCollection = null;
                model.refCount--;
            }).on('all', function(){
                self.trigger.apply(self, arguments);
            }).on('reset', function(){
                // models added during reset don't have the usual add event triggered
                var model;
                for( var i in this.models ){
                    model = this.models[i];
                    if( model.collection == this ){
                        onAdd( model );
                    }
                }
            });

            return true;
        }
        return false;
    },

    // Internal method to remove a model's ties to a collection.
    // Overriden to allow reference counts to be properly handled
    removeReferenceFromItems: function(model) {
        if (this == model.collection) {
            delete model.collection;
            model.refCount--;
        }
        model.off('all', this._onModelEvent, this);
    },

    createItemsModel: function( attrs, options ){
        var collection = (options && options.collection) ? options.collection.entityCollection : null;

        if( collection && !attrs.type ){
            attrs.type = collection.getEntityType();
        }

        if( attrs.type ){
            var result = entity.create( attrs, options );
            return result;
        }

        return new Backbone.Model( attrs, options );
    },

    models: function(){
        return this.items.models;
    },

    getEntityType: function(){
        return this.entityType || this.get('type');
    },

    // returns an identifying id for this collection to be used
    // for storage purposes
    getStoreId: function(){
        return this.id || (this.owner && (this.owner.id || this.owner.cid));
    },

    getName: function(){
        return this.name;
    },

    get: function(attr){
        if( attr == 'offset' )
            return this.get('page_size') * (this.get('page')-1);
        if( attr == 'item_count' )
            return Math.max( this.items.length, this.attributes.item_count );
        if( attr == 'page_count' )
            return Math.ceil( this.items.length / this.get('page_size') );
        var result = entity.Entity.prototype.get.apply(this,arguments);
        if( result == null ){
            result = this.items.get(attr);
        }
        return result;
    },

    set: function(key, value, options) {
        var self=this, attrs, attr, val;
        if( key === this )
            return this;

        if( _.isArray(key) || _.isObject(key) || key == null ){
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if( _.isArray(attrs) ){
            // setting collection values directly
            // log('resetting with ' + JSON.stringify(attrs) );
            this.reset( attrs, options );
            return this;
        }
        // if( _.isObject(key) || key == null) {
        //     attrs = key;
        //     options = value;
        // } else {
        //     attrs = {};
        //     attrs[key] = value;
        // }
        // if (!attrs) return this;


        if( attrs.items ){
            attrs.items = _.compact(attrs.items);
            // log('set entC ' + JSON.stringify(attrs) );
            this.reset( attrs.items );
            // print_ins( this.items.at(0).attributes );
            delete attrs.items;
        }

        var result = entity.Entity.prototype.set.apply( this, arguments );
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

    
    parse: function(resp, xhr){
        if( resp === this )
            return resp;
        // print_ins( arguments );
        if( !this.items )
            this.initialize();
        if( resp.entity ){
            var entityDef = entity.getEntityFromType( resp.entity );
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
            resp = entity.Entity.prototype.parse.apply( this, arguments );
        }
        return resp;
    },

    reset: function( models, options ){
        var self = this;
        this.items.reset( models, options );
        this.items.each( function(i){
            if( i.type === undefined )
                i.type = self.getEntityType();
            // if( options.inverse ){
                // log('setting ' + options.inverse + ' to ' + self.owner.id);
            //     print_ins(i);
            //     i.set( options.inverse, self.owner );
            // }
        });
    },

    
    
    flatten: function( options ){
        var id,item,i,len,outgoing;
        options = options || {};
        var result = options.result = (options.result || {});
        var id = this.id || this.cid;
        
        // log('flattening collection ' + id + ' with options ' + JSON.stringify(options) );
        // print_ins( this.attributes );

        // does this collection have any attributes worth serialising? if not, then ignore this and move on
        var outputSelf = this.shouldSerialise();

        if( options.toJSON ){
            outgoing = this.toJSON(_.extend(options,{referenceItems:true,includeCounts:false,returnDefaults:false}));
            if( outgoing ){
                if( this.type ) 
                    outgoing['type'] = this.type;
                if( this.id )
                    outgoing['id'] = this.id;
                else
                    outgoing['_cid'] = this.cid;

                if( outputSelf )
                    result[id] = outgoing;
            }
        }else{
            outgoing = this;
            if( outputSelf )
                result[id] = outgoing;
        }

        for( i=0,len=this.items.length;i<len;i++ ){
            item = this.items.at(i);
            // log('outputting item ' + i + ' ' + item.cid);
            // print_ins( item );
            // if( !item.flatten ){
            // }
            // else
                item.flatten(options);
        }

        return result;
    },

    // returns true if this collection should be serialised as an entity
    shouldSerialise: function(){
        return this.hasNonDefaultAttributes();
    },

    toJSON: function( options ){
        options || (options = {});
        var self = this,
            result,
            refItems = options.referenceItems,
            includeCounts = options.includeCounts,
            fullItems = options.fullItems,
            returnDefaults = options.returnDefaults,
            doRelations = _.isUndefined(options.relations) ? true : options.relations,
            itemOptions;

        if( options.collectionAsIdList ){
            return this.items.map( function(it){ return it.id || it.cid });
        }


        result = entity.Entity.prototype.toJSON.apply(this,arguments);
        // print_ins( result );

        if( includeCounts ){
            result.item_count = this.items.length;
            result.page_count = Math.ceil(result.item_count / result.page_size);
            // log('adding counts');
        } else {
            // delete result.item_count;
            // delete result.page_count;
        }

        if( doRelations && this.items.length > 0 ){

            if( refItems )
                result.items = this.items.map( function(it){ return it.id || it.cid });
            else{
                // log('1 ec toJSON ' + self.name + ' ' + self.inverseKey ); //JSON.stringify(options) );
                // itemOptions = _.extend( options, {inverseKey:self.inverseKey} );
                options.inverseKey = self.inverseKey;
                result.items = this.items.map( function(it){ 
                    // log('2 ec toJSON ' + self.name + ' ' + JSON.stringify(options) );
                    return it.toJSON(options); 
                });
            }

            // if( result.items.length )
            // log( result.items.length );
        }

        if( !this.shouldSerialise() ){
            result = result.items;
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


exports.create = function( attrs, items, options ){
    var entityType;
    options || (options = {});
    // this option has to be set in order to process any passed items/models
    // correctly
    options.parse = true;
    if( _.isArray(attrs) ){
        items = attrs;
        attrs = null;
    }
    else if( !_.isArray(items) && !options){
        options = items;
        items = null;
    }
    if( attrs && attrs.entityType ){
        entityType = attrs.entityType;
        delete attrs.entityType;
    }
    var result = new exports.EntityCollection( attrs, options );
    if( entityType )
        result.entityType = entityType;
    if( items )
        result.set( items );
    return result;
}
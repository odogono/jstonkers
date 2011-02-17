/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    
    /**
    *
    */
    set : function( attrs, options ) {
        if( attrs.team ){
            attrs.team.set({player:this},{silent:true});
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    /**
    *
    */
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.team && !_.isString(attrs.team) )
            attrs.team = attrs.team.id;
        delete attrs.match;
        return attrs;
    },
});

/**
*
*/
jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,  
});
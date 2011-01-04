/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    // initialize: function() {
    //     this.set({team:null});
    // },
    
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.team && !_.isString(attrs.team) )
            attrs.team = attrs.team.id;
        delete attrs.match;
        return attrs;
    },
});

jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,  
});
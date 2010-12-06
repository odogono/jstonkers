jstonkers.model.Match = Backbone.Model.extend({
    initialize: function(){
        this.set({ levels:[], bounds:[], window:[], zoom:1 });
    },
});


jstonkers.model.Sprite = Backbone.Model.extend({
    set : function(attrs, options) {
        if( attrs.position ) {
            this.set( {screen:{left: attrs.position[0], top: attrs.position[1]} });
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
});


jstonkers.model.Division = jstonkers.model.Sprite.extend({
});


jstonkers.model.DivisionList = Backbone.Collection.extend({
    model: jstonkers.model.Division,    
});



/**
*   A Team has:
*       - a list of divisions
*/
jstonkers.model.Team = Backbone.Model.extend({
    initialize: function(){
        this.set({ collection:new jstonkers.model.DivisionList() })
    },
    
    collection: function(){
        return this.get('collection');
    }
});



/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    initialize: function() {
        this.set({team:null});
    },
});
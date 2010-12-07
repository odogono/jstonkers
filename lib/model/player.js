/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    initialize: function() {
        this.set({team:null});
    },
});

jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,  
});
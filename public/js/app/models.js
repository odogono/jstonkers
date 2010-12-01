jstonkers.model.Player = Backbone.Model.extend({
    
    initialize: function() {
        this.set( {bounds:{ x:0, y:0, width:0, height:0, cx:0, cy:0 } } );
    },
    
    set : function(attrs, options) {
        // if( attrs.bounds )
            // console.log("calling set bounds on player!");
        // else
            // console.log("calling set on player with " + JSON.stringify(attrs) );
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
});

jstonkers.model.Match = Backbone.Model.extend({

});


jstonkers.model.Sprite = Backbone.Model.extend({
    set : function(attrs, options) {
        if( attrs.position ) {
            this.set( {screen:{left: attrs.position.x, top: attrs.position.y} });
            // this.set({left: attrs.position.x, top: attrs.position.y});
            // console.log("setting position on sprite");
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
});


jstonkers.model.Division = jstonkers.model.Sprite.extend({
    // set : function(attrs, options) {
    //     Backbone.Model.prototype.set.call(this, attrs, options);
    // },
});
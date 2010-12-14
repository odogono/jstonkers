jstonkers.model.Unit = jstonkers.model.Sprite.extend({
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        delete attrs.match;
        return attrs;
    },
});


jstonkers.model.UnitList = Backbone.Collection.extend({
    model: jstonkers.model.Unit, 
});
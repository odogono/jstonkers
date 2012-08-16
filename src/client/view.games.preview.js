var log = debug('client:view:games:preview');

jstonkers.client.view.games.Preview = Backbone.View.extend({
    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        var model = this.model || this.options.model;
        var data = model.toJSON();
        var content = Mustache.render( Templates.games.preview, data );
        return $(content).get(0);
    }
});
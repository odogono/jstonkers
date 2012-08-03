
jstonkers.client.view.game.All = Backbone.View.extend({

    initialize: function(){
    },

    render: function(){
        return this;
    },

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        return $(Templates.game.all).get(0);
    }
});
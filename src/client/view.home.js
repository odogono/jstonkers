var log = debug('client:view:home');

jstonkers.client.view.Home = Backbone.View.extend({

    events:{
        "click #title":"onClickPlay"
    },

    initialize: function(){
    },

    render: function(){
        console.log( this.$el );
        return this;
    },

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        return $(Templates.home).get(0);
    },


    onClickPlay: function(evt){
        evt.preventDefault();

        // change view to games
        jstonkers.eventBus.trigger('navigate', 'game.all');
    }
});
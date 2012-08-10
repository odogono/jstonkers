var log = debug('client:view:home');

jstonkers.client.view.Home = Backbone.View.extend({

    events:{
        "click #title":"onClickPlay"
    },

    initialize: function(){
        this.ticker = new jstonkers.client.view.Ticker();
    },

    render: function(){
        this.$ticker = this.$ticker || this.$el.find('.ticker');
        this.ticker.attach( this.$ticker );

        // console.log( this.ticker.$el );
        // 
        this.ticker.render();

        return this;
    },

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        var data = {};
        var content = Mustache.render( Templates.home, data );
        return $(content).get(0);
    },


    onClickPlay: function(evt){
        evt.preventDefault();

        // change view to games
        jstonkers.eventBus.trigger('navigate', 'games.all');
    }//*/
});
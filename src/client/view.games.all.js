var log = debug('client:view:games:all');

jstonkers.client.view.games.All = Backbone.View.extend({

    events:{
        'click .games-add':             'onAdd',
        'click .games-preview':         'onPreview',
    },


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
        var data = {};
        var content = Mustache.render( Templates.games.all, data );
        return $(content).get(0);
    },


    onAdd: function(evt){
        evt.preventDefault();

        log('adding game');
    },

    onPreview: function(evt){
        evt.preventDefault();
        var $target = $(evt.target),
            $link = $target.parents('a'),
            gameId = $link.data('game_id');

        jstonkers.eventBus.trigger('navigate', 'games/'+gameId );
    },

});
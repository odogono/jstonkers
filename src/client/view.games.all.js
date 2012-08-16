var log = debug('client:view:games:all');

jstonkers.client.view.games.All = Backbone.View.extend({

    events:{
        'click .games-add':             'onAdd',
        'click .games-preview':         'onPreview',
    },


    initialize: function(){
    },

    render: function(){
        var self = this,
            game, games = this.model.get('games'),
            view, $previews = this.$el.find('.previews'),
            Preview = jstonkers.client.view.games.Preview;

        // console.log( this.$el );
        $previews.hide().empty();
        // games.each( function(model){
        for( var i in games ){
            game = new Backbone.Model(games[i]);
            view = new Preview({model:game});
            $previews.append( view.render().el );
        }

        $previews.show();

        // var data = this.model.toJSON();
        
        // the template will include our own element...
        // var $content = $(Mustache.render( Templates.games.all, data ));
        // ... so we remove our root elements children and re-add
        // the rendered templates children
        // this.$el.empty().append( $content.children() );

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

        // this.model.get('urls')
        // log('going to preview ' + )
        JSTC.events.trigger('navigate', 'games.view', gameId );
    },

});
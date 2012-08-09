var log = debug('client:app');


jstonkers.client.App = Backbone.Router.extend({

    // routes:{
    //     'games':        'routeGames',
    //     'games/':        'routeGames',
    //     '*path':        'routeHome',
    // },

    views:{},
    models:{},

    initialize: function(options){
        var self = this;
        this.params = jstonkers.params = options;
        this.urlRoot = jstonkers.params.url.root;

        // contains state information about the app itself
        this.model = new Backbone.Model( options );

        this.createDefaultModels( options );


        this.models.home = new Backbone.Model();
        this.views.home = new jstonkers.client.view.Home({model:this.models.home});

        this.models.games = new Backbone.Model();
        this.views.games = new jstonkers.client.view.game.All({model:this.models.games});

    
        // define app routes - doing this here (as opposed to in this.routes) means we can use regex
        this.route(/^\/?\??([\&\w=]+)?$/, 'default', this.routeHome);
        this.route(/^\/?games\/?\??([\&\w=]+)?$/, 'games', this.routeGames);
        // this.route(/^\/?upload\/?\??([\&\w=]+)?$/, 'upload', this.routeImageUpload);

        jstonkers.eventBus.bind('navigate', function(target){
            switch(target){
                case 'game.all':
                    self.navigate('games', true);
                    break;
            }
            log('navigating to ' + target );
        });
        
        Backbone.history.start({pushState: true, root:jstonkers.params.url.root});
        this.initialised = true;
    },


    initiateSocket: function(){
        this.socket.connect({},function(err){
            log('connected!');
        });
    },


    createDefaultModels: function(options){
        this.socket = new jstonkers.client.ServerComms( this.params.server );
    },

    setContentView: function(name, view){
        view = view || this.views[name];

        var $viewEl = $('#content div[data-view]');
        var viewElName = $viewEl.data('view');

        // log('existing view ' + $viewEl.data('view') );

        if( this.contentView && this.contentView.cid === view.cid ){
            log('already set view ' + view.id + '(' + view.cid + ')' );
            this.contentView.render();
            return this.contentView;
        }

        if( this.contentView ){
            log('disposing of ' + this.contentView.id + ' (' + this.contentView.cid + ')');
            log( this.contentView );
            this.contentView.trigger('hide');
        }

        log('set view ' + name + '(' + view.cid + ')' );

        this.contentView = view;

        if( viewElName === name ){
            this.contentView.setElement( $viewEl );
            this.contentView.render( this );
        } else {
            var el = this.contentView.render( this ).el;
            $('#content').empty().append( el );    
        }

        this.contentView.trigger('show');
        this.contentView.delegateEvents();
        return this.contentView;
    },

    routeHome: function(){
        log('route: home');
        this.setContentView( 'home' );
    },

    routeGames: function(){
        log('route: games');
        // this.setContentView( 'games' );
    },


    routeGame: function(){
        log('route: game');
    },

    parseQS: function( qs ){
        var result = {};
        if( qs )
            _.each( qs.split('&'), function(pair){
                var parts = pair.split('=');
                result[ parts[0] ] = parts[1];
            });
        return result;
    }
});
var log = debug('client:app');


jstonkers.client.App = Backbone.Router.extend({

    // routes:{
    //     'games':        'routeGames',
    //     'games/':        'routeGames',
    //     '*path':        'routeHome',
    // },

    views:{ },
    models:{},

    initialize: function(options){
        var self = this;
        this.params = jstonkers.params = options;
        this.urlRoot = jstonkers.params.url.root;

        // console.log( this.params );

        // contains state information about the app itself
        this.model = new Backbone.Model( options );

        this.createDefaultModels( options );

        jstonkers.client.bitmapFontCanvas = new jstonkers.client.BitmapFontCanvas({ 
            chars:",/0123456789:'(=)? ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
            image:$('#font2x').get(0)
        });
        jstonkers.client.bitmapFontCanvasSml = new jstonkers.client.BitmapFontCanvas({ 
            chars:",/0123456789:'(=)? ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
            image:$('#font').get(0), charWidth:8, charHeight:8, kern:0
        });

        this.models.home = new Backbone.Model();
        this.views.home = new jstonkers.client.view.Home({model:this.models.home});

        this.models.games = new Backbone.Model();
        this.views['games.all'] = new jstonkers.client.view.games.All({model:this.models.games});

    
        // define app routes - doing this here (as opposed to in this.routes) means we can use regex
        this.route(/^\/?\??([\&\w=]+)?$/, 'default', this.routeHome);
        this.route(/^\/?games\/?\??([\&\w=]+)?$/, 'games', this.routeGames);
        // this.route(/^\/?upload\/?\??([\&\w=]+)?$/, 'upload', this.routeImageUpload);

        jstonkers.eventBus.bind('navigate', function(target){
            switch(target){
                case 'games.all':
                    self.navigate('games', true);
                    break;
            }
            log('navigating to ' + target );
        });
        
        Backbone.history.start({pushState: true, root:jstonkers.params.url.root});
        this.initialised = true;

        jstonkers.eventBus.trigger('start');
        this.animationLoop();
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

        log('page view ' + viewElName + ' new view ' + name);

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
            log('attaching to existing ' + name );
            this.contentView.setElement( $viewEl );
            this.contentView.render( this );
            // console.log( this.contentView.el );
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
        this.setContentView( 'games.all' );
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
    },


    animationLoop: function(){
        var self = this,
            now, last = Date.now(),
            dtBuffer = 0,
            factor = 0,
            lastTS = Date.now(),
            fps = 30,
            eventBus = jstonkers.eventBus;
        // mc.maxCount = 0;
        
        function step(ts) {
            now = Date.now();
            dt = now - last;
            dtBuffer += dt;
            // self.view.hide();

            // mc.updateCount = 0;
            while (dtBuffer >= fps) {
                // self.match.update(factor, dt, self.fps);
                dtBuffer -= fps;
                if( dtBuffer > fps*1000 ){
                    // NOTE AV : sometimes dtbuffer can get too large
                    dtBuffer = 0;
                }
            }//*/

            // self.view.render( now );
            // self.view.show();
            eventBus.emit( 'anim', now );
            // jstonkers.eventBus.trigger('anim',now);
            // console.log( emit === jstonkers.eventBus.trigger );

            // mc.log( 'ts: ' + (ts - lastTS), true);
            // mc.maxCount = Math.max(mc.maxCount,mc.updateCount);
            // mc.log('updateCount: ' + mc.maxCount,true);
            lastTS = now;
            requestAnimationFrame( step );
            last = now;
        }
        
        requestAnimationFrame( step );
    }
});
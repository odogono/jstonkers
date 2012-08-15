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
        this.model.on('change:active', function(model,active,changes){
            // log( 'MAIN MODEL changed active to ' + active );
            // console.log( arguments );
        })

        this.createDefaultModels( options );

        JSTC.bitmapFontCanvas = jstonkers.client.bitmapFontCanvas = new jstonkers.client.BitmapFontCanvas({ 
            chars:",/0123456789:'(=)? ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
            image:$('#font2x').get(0)
        });

        jstonkers.client.bitmapFontCanvasSml = new jstonkers.client.BitmapFontCanvas({ 
            chars:",/0123456789:'(=)? ABCDEFGHIJKLMNOPQRSTUVWXYZ", 
            image:$('#font').get(0), charWidth:8, charHeight:8, kern:0
        });

        // attach the global nav view to the existing dom structure
        this.views.global = new jstonkers.client.view.Global({id:'global', model:this.model,el:$('.navbar')});

        this.models.home = new Backbone.Model();
        this.views.home = new jstonkers.client.view.Home({id:'home',model:this.models.home});

        this.models.games = new Backbone.Model();
        this.views['games.all'] = new jstonkers.client.view.games.All({id:'games.all',model:this.models.games});

        this.models.game = new Backbone.Model();
        this.views['games.view'] = new jstonkers.client.view.games.View({id:'games.view',model:this.models.game});

    
        // define app routes - doing this here (as opposed to in this.routes) means we can use regex
        this.route(/^\/?\??([\&\w=]+)?$/, 'default', this.routeHome);
        this.route(/^\/?games\/?$/, 'games.all', this.routeAllGame);
        this.route(/^\/?games\/([\w]+)/, 'games.view', this.routeGame);
        // this.route(/^\/?upload\/?\??([\&\w=]+)?$/, 'upload', this.routeImageUpload);

        jstonkers.eventBus.bind('navigate', function(target){
            switch(target){
                case 'games.all':
                    self.navigate('games', true);
                    break;
                // case 'games.view':
                    // self.navigate('games', true);
                    // break;
                default:
                    self.navigate(target, true);
                    // log('unknown target ' + target);
                    break;
            }
            
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

        // log('page view ' + viewElName + ' new view ' + name);

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
        this.model.set('active', name);

        this.contentView = view;

        if( viewElName === name ){
            log('attaching to existing ' + name );
            this.contentView.setElement( $viewEl );
            this.contentView.render( this );
            // console.log( this.contentView.el );
        } else {
            log('rendering new');
            var el = this.contentView.render( this ).el;
            $('#content').empty().append( el );
        }

        this.contentView.trigger('show');
        jstonkers.eventBus.trigger('view:show', name);
        this.contentView.delegateEvents();
        return this.contentView;
    },

    routeHome: function(){
        log('route: home');
        this.setContentView( 'home' );
    },

    routeAllGame: function(){
        log('route: games');
        this.setContentView( 'games.all' );
    },


    routeGame: function(){
        log('route: game');
        this.setContentView( 'games.view' );
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
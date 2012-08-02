
var log = debug('client:app');

jstonkers.client.App = Backbone.Router.extend({
    initialize: function(options){
        this.params = jstonkers.params = options;
        this.urlRoot = jstonkers.params.url.root;

        this.createDefaultModels( options );
    
        // define app routes - doing this here (as opposed to in this.routes) means we can use regex
        this.route(/^\/?\??([\&\w=]+)?$/, 'default', this.routeMain);
        // this.route(/^\/?news\/?\??([\&\w=]+)?$/, 'news', this.routeMain);
        // this.route(/^\/?upload\/?\??([\&\w=]+)?$/, 'upload', this.routeImageUpload);
        
        Backbone.history.start({pushState: true, root:jstonkers.params.url.root});
        this.initialised = true;
    },


    initiateSocket: function(){

        this.socket.connect({},function(err){
            log('connected!');
        });

        // var socket = io.connect('http://localhost/');
        // var socket = io.connect('http://localhost:' + jstonkers.params.server.port );
        // socket.on('connect', function () {
        //     socket.send('hi');
        //     socket.on('message', function (msg) {
        //         log('received ' + JSON.stringify(msg));
        //         log( msg );
        //     });
        // });
    },


    createDefaultModels: function(options){
        this.socket = new jstonkers.client.ServerComms( this.params.server );
    },


    routeMain: function(){
        log('route: main');
        this.initiateSocket();
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
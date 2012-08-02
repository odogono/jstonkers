var dlog = debug('client:server_comms');

// 
// Handles all 'realtime' communication duties for the app
// 
jstonkers.client.ServerComms = Backbone.Model.extend({
    defaults:{
        url: 'http://localhost/',
        connected: false
    },

    buildConnectionString: function(){
        var result = [ this.get('url') ],
            port = this.get('port'),
            siotoken = this.get('siotoken');

        if( port )
            result.push( ':' + port );
        if( siotoken )
            result.push( '?siotoken=' + siotoken );

        return result.join('');
    },

    // 
    // 
    // 
    connect: function(options, callback){
        var self = this;
        options = options || {};
        var url = this.buildConnectionString(); //options.url || this.get('url');

        dlog('connecting to ' + url + '...');

        this.socket = io.connect(url)
        .on('error', function(reason){
            dlog('connect error ' + reason );
            self.trigger('disconnect', 'error', reason);
        })
        .on('connect', function(){
            // var sio_id = this.socket.sessionid;
            dlog('connected');
            callback.call(self);
        })
        .on('connect_failed', function(){
            dlog('connect_failed: ' + JSON.stringify(arguments));
            self.set({connected:false});
        })
        .on('message', function(){
            // self.onMessage();
            dlog('message: ' + JSON.stringify(arguments) );
        })
        .on('reconnecting', function(reconnectionDelay,reconnectionAttempts){
            dlog('reconnecting ' + reconnectionAttempts );
        })
        .on('disconnect', function(){
            dlog('disconnected');
            self.set({connected:false});
        });
        
        // register all events
        for( name in this.events ){
            this.socket.on( name, this.events[name] );
        }

        this.events = {};
    },

    disconnect: function(options){
        this.socket.disconnect();
    },

    onConnected: function(){

    }
});
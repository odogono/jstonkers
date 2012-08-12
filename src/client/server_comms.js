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
        // log('HEY! REQUESTING IT ' + url );
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
        })
        // entity update
        .on('entity', function(entityId, attr){

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

    },

    // sendCommand: function( commandId, callback ){
    //     var args = Array.prototype.slice.call(arguments);
    //     var callback = args[ args.length-1 ];
    //     // callback = _.isFunction(callback) ? callback : null;

    //     if( !this.get('connected') ){
    //         callback('not connected');
    //         return;
    //     }
    //     this.socket.emit('join_game', gameId, function(err,result){
    //         if( err ){ callback( err ); return; }
    //         callback(null,result);
    //     });
    // },

    /**
     * Request that a game be joined
     * @param  {[type]}   gameId   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    sendJoinGame: function(gameId, callback){
        if( !this.get('connected') ){
            callback('not connected');
            return;
        }
        this.socket.emit('join_game', gameId, function(err,result){
            if( err ){ callback( err ); return; }
            callback(null,result);
        });
    },

    /**
     * [requestLeaveGame description]
     * @param  {[type]}   gameId   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    sendLeaveGame: function(gameId, callback){
        if( !this.get('connected') ){
            callback('not connected');
            return;
        }
        this.socket.emit('leave_game', gameId, function(err,result){
            if( err ){ callback( err ); return; }
            callback(null,result);
        });
    },

    sendUnitOrder: function( gameId, unitId, order, callback ){
        if( !this.get('connected') ){
            callback('not connected');
            return;
        }
        this.socket.emit('order', gameId, unitId, order, function(err, result){
            if( err ){ callback( err ); return; }
            callback( null, result );
        });
    },

    requestGameState: function( gameId, callback ){
        if( !this.get('connected') ){
            callback('not connected');
            return;
        }
        this.socket.emit('game_state', gameId, function(err,result){
            if( err ){ callback( err ); return; }
            callback(null,result);
        });
    },

    requestUnitState: function( gameId, unitId, callback ){
        if( !this.get('connected') ){
            callback('not connected');
            return;
        }
        this.socket.emit('unit_state', gameId, unitId, function(err,result){
            if( err ){ callback( err ); return; }
            callback(null,result);
        });
    },

});
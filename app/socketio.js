var app = module.parent.exports;
var socketio = require('socket.io');

if( !app.config.socketio.enabled ) {
    log('socket server disabled');
    return;
}

var io = app.socketio = socketio.listen(app.server);
var buffer = [];


io.on('connection', function(client){
    var session = client.handshake.session;

    log('connected with sio.id ' + client.id + ' user.id '  );

    client
        .on('message', function(msg){
            log('received client message: ' + JSON.stringify(arguments) );        
        })
        .on('disconnect', function(){
            // log('disconnected');
        })
        .on('ping', function(time,callback){
            if( callback ){
                callback(time);
            } else
                this.emit('pong', time);
        })
        .on('join_game', function(gameId,callback){

        })
        .on('leave_game', function(gameId){

        })
        .on('order', function(callback){

        })
        .on('game_state', function(callback){

        })
        .on('unit_info', function(callback){

        })
        .on('user_info', function( userId, callback ){

        })
        .on('telegram', function( message, targetId, callback ){

        });
});

io.configure(function(){

    io.set('log level', 1);
    io.set('transports', ['websocket']);

    io.set('authorization', function(data,accept){
        // look for the token that gets passed in the connection query string
        var token = (data.query && data.query.siotoken) ? data.query.siotoken : null;
        // look up session id from the token
        jstonkers.sync.getSessionIdFromSioToken( token, function(err,sessionID){
            if( sessionID ){
                app.store.load(sessionID,  function (err, session) {
                    if (err || !session){
                        accept('not found', false);
                    } else {
                        data.session = session;
                        accept( null, true );
                    }
                });
            } else {
                accept(null, false);
            }
        });
    });
});

log('socket server started');
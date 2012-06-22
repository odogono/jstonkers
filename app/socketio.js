var app = module.parent.exports;
var socketio = require('socket.io');

if( !app.config.socket_server.enabled ) {
    log('socket server disabled');
    return;
}

log('socket server enabled');
var io = app.socketio = socketio.listen(app.server);
var buffer = [];

io.on('connection', function(client){ 
    
    client.json.send({msg:'welcome',sess:client.sessionId});
    
    client.on('message', function(message){
        log('client message: ' + JSON.stringify(message) );
    });
    
    client.on('disconnect', function(){
        log('client disconnected');
    });
});
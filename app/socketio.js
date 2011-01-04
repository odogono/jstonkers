var app = module.parent.exports;

if( !app.config.socket_server.enabled ) {
    log('socket server disabled');
    return;
}

log('socket server enabled');
var io = socketio.listen(app);
var buffer = [];

app.socketio = io;

io.on('connection', function(client){ 
    
    client.send({msg:'welcome, bro',sess:client.sessionId});
    // client.broadcast({ announcement: client.sessionId + ' connected' });
    
    client.on('message', function(message){
        log('client message: ' + JSON.stringify(message) );
    });
    
    client.on('disconnect', function(){
        log('client disconnected');
    });
});
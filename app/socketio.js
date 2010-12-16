var app = module.parent.exports;

var io = socketio.listen(app),
     buffer = [];

app.socketio = io;

io.on('connection', function(client){ 
    
    // client.broadcast({ announcement: client.sessionId + ' connected' });
    
    client.on('message', function(message){
        log('client message: ' + message );
    });
    
    client.on('disconnect', function(){
        log('client disconnected');
    });
});
// in ./app.js we did "module.exports", allowing
// us to grab the app from the parent module (the one 
// which required it)
var app = module.parent.exports;

var io = socketio.listen(app),
     buffer = [];
     
io.on('connection', function(client){ 
    
    // client.broadcast({ announcement: client.sessionId + ' connected' });
    
    client.on('message', function(message){
        log('client message: ' + message );
    });
    
    client.on('disconnect', function(){
        log('client disconnected');
    });
});
var app = module.parent.exports;
var socketio = require('socket.io');

if( !app.config.socketio.enabled ) {
    log('socket server disabled');
    return;
}

var io;
var buffer = [];

/*
var existingAppStart = app.start;
app.start = function(options,callback){
    var self = this;

    Step(
        function(){
            io = app.socketio = socketio.listen(app.server);
            io.on('connection', onConnection);

            log('socket server started');
            this();
        },
        function(){
            existingAppStart(options,this);
        },
        function(){
            // print_ins( callback );
            if( callback )
                callback();
        }
    )
}//*/




io = app.socketio = socketio.listen(app.server);

io.on('connection', function(client){
    var session = client.handshake.session;

    client
        .on('message', function(msg){
            log('received client message: ' + JSON.stringify(arguments) );        
        })
        .on('disconnect', function(){
            // log('disconnected');
        })
        .on('ping', function(time,cb){
            if( cb ){
                cb(time);
            } else
                this.emit('pong', time);
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
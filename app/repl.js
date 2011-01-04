// taken from https://github.com/joyent/node-camp/blob/master/hexes/server.js

var app = module.parent.exports;
var repl = require('repl');
var net = require('net');

if( app.config.repl_server.enabled ) {
    
    net.createServer(function (connection) {
      connection.write("Welcome to the backdoor\n");
      require('child_process').exec("uname -a", function (err, stdout, stderr) {
        connection.write(stdout + "\n");
        var context = repl.start("jstonkers server> ", connection).context;
        context.socket = app.socketio;
        // context.map = map;
        context.server = app;
        context.app = app;
        // context.clients = clients;
        context.reload = function () {
          app.socketio.broadcast({reload:true});
        };
        context.move = function (id, x, y) {
          app.socketio.broadcast({move: {id: id, x: x, y: y}});
        };
      });
    }).listen(app.config.repl_server.port);
    
    console.log('repl server listening on port ' + app.config.repl_server.port );
}
#!/usr/bin/env node

common = require('./common');
var port = 3000;

// Our app IS the exports, this prevents require('./app').app,
// instead it is require('./app');
var server = module.exports = express.createServer(
    connect.logger(),
    connect.compiler({ src:dir_public, enable: ['sass'] }),
    connect.cookieDecoder(),
    connect.session(),
    connect.staticProvider(dir_public),
    // for parsing JSON request bodies - ends up in req.body
    express.bodyDecoder()
);

// for spark2 compatibility
module.exports = server;

log("using " + dir_public );

// set the port to use if specified
if( process.argv.length >= 2 )
    port = parseInt(process.argv[2]);

server.set('view engine', 'haml');
server.set('views', path.join(__dirname,'views') );

server.configure('development', function()
{
    server.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});



require('./helpers');
require('./socketio');
require('./handlers');
require('./repl');

server.listen(port);
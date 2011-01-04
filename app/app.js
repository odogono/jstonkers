#!/usr/bin/env node

var common = require('./common');
var port = 3000;

// Our app IS the exports, this prevents require('./app').app,
// instead it is require('./app');
var app = module.exports = express.createServer();

// set the port to use if specified
if( process.argv.length >= 2 )
    port = parseInt(process.argv[2]);

require('./config');

// create the storage manager
app.persistentStorage = jstonkers.utils.PersistentStorage.create();

require('./helpers');
require('./socketio');
require('./handlers');
require('./repl');

app.listen(port);

console.log('app started on port ' + port );
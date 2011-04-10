#!/usr/bin/env node

var common = require('./common');
var port = null;
var environment = null;
var fs = require('fs');

// parse command line args
var args = process.argv.slice(2);
while (args.length) {
    var arg = args.shift();
    switch( arg ){
        case '-p':
        case '--port':
            if (arg = args.shift()) {
                port = parseInt(arg, 10);
            } else {
                throw new Error('--port requires a number');
            }
            break;
        case '-e':
        case '--env':
            if (arg = args.shift())
                environment = arg;
            break;
    }
}

// if an environment has been specified, then apply values from it to the main config
if( environment && jstonkers.config.environment[environment] ){
    _.each( jstonkers.config.environment[environment], function(value,key){
        jstonkers.config[key] = value;
    });
}

// Our app IS the exports, this prevents require('./app').app,
// instead it is require('./app');
var app = module.exports = express.createServer();

require('./config');

require('./helpers');
require('./socketio');

fs.readdir(__dirname + '/handlers', function(err, files) {
    if (err) throw err;
    files.forEach(function(file) {
        require('./handlers/' + file.replace('.js',''));
    });
});

require('./repl');

// read from config first
port = parseInt(port || jstonkers.config.server.port, 10);
app.listen(port);

console.log('app started on port ' + port + ' running in env ' + environment );
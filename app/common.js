var path = require("path");
var util = require("util");

exports.app_paths = {
    root: path.join( path.dirname(__filename), '../' ),
    app: path.join( exports.root, 'app' ),
    etc: path.join( exports.root, 'etc' ),
    lib: path.join( exports.root, 'lib' ),
    web: path.join( exports.root, 'web' ),
    src: path.join( exports.root, 'src' ),
    var: path.join( exports.root, 'var' ),
    test: path.join( exports.root, 'test' ),
    view: path.join( exports.root, 'app', 'views' ),
};

[   '.',
    'underscore',
    'backbone',
    'connect/lib',
    'express/lib',
    'sass.js/lib',
    'nodeunit/lib',
    'Socket.IO-node',
    'Socket.IO-node/lib',
    'Socket.IO-node/support/node-websocket-client/lib',
    // 'request',
    'node-mongodb-native/lib',
    'q/lib'
    // 'mongoose/lib' 
].forEach( function(libpath){
    require.paths.push( path.join( exports.app_paths.lib, libpath ) );
});

require( 'mustache.js' );

exports._ = exports.underscore = require('underscore');
global.Backbone = exports.Backbone = require('backbone');
exports.connect = require('connect');
exports.express = require('express');
exports.socketio = require('socket.io');
exports.request = require('request/main');
// exports.mongoose = require('mongoose');
exports.mongodb = require('mongodb');
exports.assert = require('assert');
require('q');
exports.path = path;

for (var i in util) exports[i] = util[i];
// NOTE AV : pushing everything into global the right thing to do ?
for (var i in exports) global[i] = exports[i];

require.paths.push( exports.app_paths.src );
exports.jstonkers = require('jstonkers').jstonkers;
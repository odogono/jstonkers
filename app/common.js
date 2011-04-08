var path = require('path');
var util = require('util');
var fs = require('fs');

var root = path.join( path.dirname(__filename), '../' );

exports.app_paths = {
    root: root,
    app: path.join( root, 'app' ),
    etc: path.join( root, 'etc' ),
    lib: path.join( root, 'lib' ),
    web: path.join( root, 'web' ),
    src: path.join( root, 'src' ),
    var: path.join( root, 'var' ),
    test: path.join( root, 'test' ),
    view: path.join( root, 'app', 'views' ),
};

[   '.',
    'underscore',
    'backbone',
    'connect/lib',
    'express/lib',
    'sass.js/lib',
    'nodeunit/lib',
    'step/lib',
    'Socket.IO-node',
    'Socket.IO-node/lib',
    'Socket.IO-node/support/node-websocket-client/lib',
    'connect-session-file/lib',
].forEach( function(libpath){
    require.paths.push( path.join( exports.app_paths.lib, libpath ) );
});

require( 'mustache.js' );
exports.uuid = require( 'node-uuid/uuid' );
exports.Step = require('step');

exports._ = exports.underscore = require('underscore');
global.Backbone = exports.Backbone = require('backbone');
exports.connect = require('connect');
exports.express = require('express');
exports.socketio = require('socket.io');
exports.request = require('request/main');
exports.assert = require('assert');
exports.FileSessionStore = require('connect-session-file');
require('q');
exports.path = path;

for (var i in util) exports[i] = util[i];
// NOTE AV : pushing everything into global the right thing to do ?
for (var i in exports) global[i] = exports[i];

require.paths.push( exports.app_paths.src );
exports.jstonkers = require('jstonkers').jstonkers;
exports.jstonkers.config = JSON.parse( fs.readFileSync( path.join( app_paths.etc, 'config.json' ) ) );
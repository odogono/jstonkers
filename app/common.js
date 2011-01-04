var path = require("path");
var util = require("util");

// exports.root = path.join( path.dirname(__filename), '../' );
// exports.dir_app = path.join( exports.root, 'app' );
// exports.dir_etc = path.join( exports.root, 'etc' );
// exports.dir_var = path.join( exports.root, 'var' );
// exports.dir_lib = path.join( exports.root, 'lib' );
// exports.dir_src = path.join( exports.root, 'src' );
// exports.dir_vendor = path.join( exports.root, 'vendor' );
// exports.dir_pub = path.join( exports.root, 'public' );

exports.app_paths = {
    root: path.join( path.dirname(__filename), '../' ),
    app: path.join( exports.root, 'app' ),
    etc: path.join( exports.root, 'etc' ),
    lib: path.join( exports.root, 'lib' ),
    pub: path.join( exports.root, 'public' ),
    src: path.join( exports.root, 'src' ),
    var: path.join( exports.root, 'var' ),
}

require.paths.push( path.join( exports.app_paths.lib, 'underscore') );
exports._ = exports.underscore = require('underscore');

require.paths.push( path.join( exports.app_paths.lib, 'backbone') );
global.Backbone = exports.Backbone = require('backbone');

require.paths.push( path.join( exports.app_paths.lib, 'connect', 'lib') );
exports.connect = require('connect');

require.paths.push( path.join( exports.app_paths.lib, 'express' ,'lib') );
exports.express = require('express');

require.paths.push( path.join( exports.app_paths.lib, 'haml-js', 'lib') );
exports.haml = require('haml');

require.paths.push( path.join( exports.app_paths.lib, 'sass.js', 'lib'))
require.paths.push( exports.dir_src );

require.paths.push( path.join( exports.app_paths.lib, 'nodeunit', 'lib'))

exports.dir_socketio = path.join( exports.app_paths.lib, 'Socket.IO-node' );
require.paths.push( path.join( exports.dir_socketio, 'lib') );
require.paths.push( path.join( exports.dir_socketio, 'support', 'node-websocket-client', 'lib') );
exports.socketio = require('socket.io');

require.paths.push( path.join( exports.app_paths.lib, 'node-utils') );
exports.request = require('request/main');

exports.assert = require('assert');
exports.path = path;

for (var i in util) exports[i] = util[i];
for (var i in exports) global[i] = exports[i];


require.paths.push( exports.app_paths.src );
exports.jstonkers = require( path.join(exports.app_paths.src,'jstonkers') ).jstonkers;
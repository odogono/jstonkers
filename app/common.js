var path = require("path");

exports.root = path.join( path.dirname(__filename), '../' );
exports.dir_app = path.join( exports.root, 'app' );
exports.dir_var = path.join( exports.root, 'var' );
exports.dir_lib = path.join( exports.root, 'lib' );
exports.dir_src = path.join( exports.root, 'src' );
exports.dir_vendor = path.join( exports.root, 'vendor' );
exports.dir_public = path.join( exports.root, 'public' );


require.paths.push( path.join( exports.dir_vendor, 'underscore') );
exports._ = exports.underscore = require('underscore');

require.paths.push( path.join( exports.dir_vendor, 'backbone') );
global.Backbone = exports.Backbone = require('backbone');

require.paths.push( exports.dir_lib );

exports.jstonkers = require( path.join(exports.dir_lib,'jstonkers') ).jstonkers;

require.paths.push( path.join( exports.dir_vendor, 'connect/lib') );
exports.connect = require( path.join( exports.dir_vendor, 'connect/lib/connect') );

require.paths.push( path.join( exports.dir_vendor, 'express/lib') );
exports.express = require('express');
// exports.express = require( path.join( exports.dir_vendor, 'express/lib/express') );

require.paths.push( path.join( exports.dir_vendor, 'haml-js/lib') );
exports.haml = require('haml');

require.paths.push( path.join( exports.dir_vendor, 'jade/lib') );
exports.jade = require('jade');

// exports.couchdb = require( path.join( exports.dir_vendor, 'node-couchdb/lib/couchdb') );

require.paths.push( path.join( exports.dir_vendor, 'sass.js/lib'))
require.paths.push( exports.dir_src );

require.paths.push( path.join( exports.dir_vendor, 'nodeunit/lib'))

// require.paths.push( path.join(exports.dir_vendor, 'vendor/node-amqp') );
// exports.amqp = require( path.join( exports.dir_vendor, 'node-amqp/amqp')  );

exports.assert = require('assert');
exports.path = path;

var util = require("util");
for (var i in util) exports[i] = util[i];
for (var i in exports) global[i] = exports[i];
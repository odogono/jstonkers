var path = require("path");

exports.root = path.join( path.dirname(__filename), '../' );
exports.dir_var = path.join( exports.root, 'var' );
exports.dir_lib = path.join( exports.root, 'lib' );
exports.dir_src = path.join( exports.root, 'src' );
exports.dir_vendor = path.join( exports.root, 'vendor' );
exports.dir_public = path.join( exports.root, 'public' );

require.paths.push( exports.dir_src )

require.paths.push( path.join( exports.dir_vendor, 'connect/lib') );
exports.connect = require( path.join( exports.dir_vendor, 'connect/lib/connect') );

require.paths.push( path.join( exports.dir_vendor, 'express/lib') );
exports.express = require('express');
// exports.express = require( path.join( exports.dir_vendor, 'express/lib/express') );

require.paths.push( path.join( exports.dir_vendor, 'haml-js/lib') );
exports.haml = require('haml');

// exports.couchdb = require( path.join( exports.dir_vendor, 'node-couchdb/lib/couchdb') );

require.paths.push( path.join( exports.dir_vendor, 'sass.js/lib'))
require.paths.push( exports.dir_src );

// require.paths.push( path.join(exports.dir_vendor, 'vendor/node-amqp') );
// exports.amqp = require( path.join( exports.dir_vendor, 'node-amqp/amqp')  );

exports.assert = require('assert');
exports.path = path;

var util = require("util");
for (var i in util) exports[i] = util[i];
for (var i in exports) global[i] = exports[i];
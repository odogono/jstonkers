module.exports = Common = {
    fs:         require('fs'),
    util:       require('util'),
    log:        require('util').log,
    inspect:    require('util').inspect,
    path:       require('path'),
    assert:     require('assert'),
    should:     require('should'),
    vm:         require('vm')
}

var path = Common.path;
Common.root = path.join( path.dirname(__filename), '../' );

Common.paths = {
    root: Common.root,
    app: path.join( Common.root, 'app' ),
    data: path.join( Common.root, 'data' ),
    schema: path.join( Common.root, 'data', 'schema' ),
    etc: path.join( Common.root, 'etc' ),
    lib: path.join( Common.root, 'node_modules' ),
    src: path.join( Common.root, 'src' ),
    scenarios: path.join( Common.root, 'src', 'scenario' ),
    templates: {
        cms: path.join(Common.root, 'app', 'templates', 'cms'),
        main: path.join(Common.root, 'app', 'templates', 'main')
    },
    test: path.join( Common.root, 'test' ),
    'var': path.join( Common.root, 'var' ),
    view: path.join( Common.root, 'app', 'views' ),
    web: path.join( Common.root, 'web' ),
    jslib: path.join( Common.root, 'web', 'js', 'lib' ),
    mapColData: path.join( 'img', 'maps' )
};

Common.version = require('../package').version;
Common.config = require( path.join(Common.paths.etc, 'config.json') );

// apply environment specific config
if( Common.config.env && Common.config.env[process.env.NODE_ENV] ){

    function mergeRecursive(obj1, obj2) {
        for (var p in obj2) {
            if( obj2.hasOwnProperty(p) ){
                if( obj1 === undefined )
                    obj1 = {};
                obj1[p] = (typeof obj2[p] === 'object') ? mergeRecursive(obj1[p], obj2[p]) : obj2[p];
            }
        }
        return obj1;
    }
    Common.config = mergeRecursive( Common.config, Common.config.env[process.env.NODE_ENV] );
    Common.config.env.current = process.env.NODE_ENV;
}

require('./common.utils');

// include libs
// uuid = require('node-uuid');
URI = require('JSV/lib/uri/uri').URI;
JSV = require('JSV/lib/jsv').JSV;
program = require('commander');
mustache = require( path.join( Common.paths.jslib, 'mustache.min' ) );
jsonpointer = require('jsonpointer/jsonpointer');
Step = require('step/lib/step');
connect = require('connect');
// parseCookie = require('connect').utils.parseCookie;
express = require('express');
_ =  exports.underscore = require( path.join( Common.paths.jslib, 'underscore-min' ) );
_.str = require( path.join( Common.paths.jslib, 'underscore.string.min' ) );
_.mixin(_.str.exports());

// provide backbone with a specific context so that it can find underscore and jQuery functions
var backboneContext = {
    log: log, print_ins:print_ins,
    module: {
        exports: exports
    },
    jQuery: { ajax:function(){} },
    _:_
};
Common.vm.runInNewContext(Common.fs.readFileSync(path.join(Common.paths.jslib, 'backbone.js')), backboneContext);
Backbone = backboneContext.Backbone;


Common.schema = require('./schema');
Common.schema.register( 
    'urn:schemas-opendoorgonorth:jstonkers:entity',
    Common.path.join(Common.paths.schema, 'entity.json') );

Common.sync = require('./sync');
Common.entity = entity = require('./entity');
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
    entity: path.join( Common.root, 'src', 'entity' ),
    commands: path.join( Common.root, 'src', 'command' ),
    templates: {
        cms: path.join(Common.root, 'app', 'templates', 'cms'),
        main: path.join(Common.root, 'app', 'templates', 'main')
    },
    test: path.join( Common.root, 'test' ),
    'var': path.join( Common.root, 'var' ),
    view: path.join( Common.root, 'app', 'views' ),
    web: path.join( Common.root, 'web' ),
    jslib: path.join( Common.root, 'web', 'js', 'lib' ),
    mapColData: path.join( 'img', 'maps' ),
    entities: path.join( Common.root, 'src', 'entity' )
};

Common.version = require('../package').version;
Common.config = require( path.join(Common.paths.etc, 'config.json') );

// apply environment specific config
var env = process.env.NODE_ENV || 'development';
if( Common.config.env && Common.config.env[env] ){

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
    Common.config = mergeRecursive( Common.config, Common.config.env[env] );
    Common.config.env.current = env;
}

winston = require('winston');
// winston.setLevels(winston.config.syslog.levels);
Common.log = new (winston.Logger)({
    transports:[
        new (winston.transports.Console)( Common.config.logging )
    ]
});

require('./common.utils');

// include libs
// debug = require('debug');
// program = require('commander');
Step = require('step/lib/step');
express = require('express');

_ =  exports.underscore = require( path.join( Common.paths.jslib, 'underscore' ) );
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

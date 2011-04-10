require('../common');
var testCase = require('nodeunit').testCase;
var fs = require('fs');

var app = require( path.join( app_paths.app, 'app') );

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        
        // log( "TMP DIR " + process.env.TMPDIR );
        // clean up
        callback();
    },

    testNew: function(test){
        test.expect(3);
        
        assert.response(test, app,
            {   url: '/match/new', method:'POST' },
            {   status: 200,
                body: function(res){
                    res = JSON.parse(res);
                    test.ok( res.ok );
                    test.ok( _.isString(res.id) );
                }
            },
            function(){
                test.done();
            });
    },
    
    
    testClone: function(test){
        
        // clone existing match - clone testa
        
        test.done();
    }
});
    
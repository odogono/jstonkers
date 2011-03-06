require('../common');
var testCase = require('nodeunit').testCase;
var fs = require('fs');

var app = require( path.join( app_paths.app, 'app') );

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },

    testNew: function(test){
        test.expect(2);
        
        assert.response(test, app,
            { url: '/match/new', method:'POST' },
            // { body: 'Cannot GET /'},
            {   status: 200,
                body: 'ok',
            },
            function(){
                test.done();
            });
    },
    
});
    
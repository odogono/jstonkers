var testCase = require('nodeunit').testCase;
var fs = require('fs');


module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testCreate: function(test) {
        var manager = jstonkers.storage.Manager.create();
        
        test.done();
    },
    
});
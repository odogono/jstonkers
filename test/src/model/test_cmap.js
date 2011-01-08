var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        this.cmap = new jstonkers.model.CMap();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testLoad: function(test) {
        var options = {
            data:"var/maps/b.col.png",
            dims:[ 8,9 ]
        };
        
    },
});
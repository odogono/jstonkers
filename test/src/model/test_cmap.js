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
            data: 'var/test/cmap.pix'
        };
        
        this.cmap = jstonkers.model.createCMap( options );
        
        test.equals( this.cmap.width, 8 );
        test.equals( this.cmap.height, 8 );
        test.equals( this.cmap.data.length, 64 );
        
        test.done();
    },
});
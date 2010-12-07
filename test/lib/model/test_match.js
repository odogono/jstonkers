var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        this.match = new jstonkers.model.Match();
        this.foo = 'bar';
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    test1: function (test) {
        test.equals(this.foo, 'bar');
        test.done();
    },
    
    testLoading: function(test){
        log( "var dir: " + dir_var );
        
        var state = JSON.parse( fs.readFileSync( path.join( dir_var, 'test', 'match_state.json' ) ) );
        
        log( state );
    },
});
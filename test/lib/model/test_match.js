var testCase = require('nodeunit').testCase;

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
    }
});
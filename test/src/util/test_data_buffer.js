var testCase = require('nodeunit').testCase,
    fs = require('fs'),
    log = require('util').log,
    inspect = require('util').inspect;


module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testCreate: function( test ) {        
        var ds = jstonkers.utils.DataBuffer.create();
        
        test.done();
    },
    
    testTestBytes: function( test ) {
        var data = [137, 80, 78, 71, 13, 10, 26, 10, 99, 100];
        var ds = jstonkers.utils.DataBuffer.create( data );
        
        test.ok( ds.testBytes( [137, 80, 78, 71, 13, 10, 26, 10] ) );
        test.ok( ds.testBytes( [99, 100] ) );
        test.ok( ds.finished() );
        
        test.done();
    },
    
    testRead: function( test ) {
        var data = new Buffer( [0,0,0,13] );
        var ds = jstonkers.utils.DataBuffer.create( data );
        
        test.ok( ds.readInt(), 13 );
        test.ok( ds.finished() );
        
        data = new Buffer( [1,2,3, 78, 105, 99, 101, 30, 40, 50, 60, 56] );
        ds = jstonkers.utils.DataBuffer.create( data );
        
        test.ok(ds.testBytes( [1,2,3] ));
        test.equal( ds.readString(4), 'Nice' );
        
        var otherData = new Buffer( [30, 40, 50, 60]);
        test.equal( ds.readBytes(4).toString(), otherData.toString() );
        
        test.equal( ds.readByte(), 56 );
        test.ok( ds.finished() );
        
        test.done();
    },
    
    testReadString: function( test ) {
        
        var data = new Buffer( [0x54, 0x65, 0x73, 0x74, 0x20, 0x53, 0x74, 0x72, 0x69, 0x6E, 0x67, 0, 0x47, 0x6F, 0x6F, 0x64] );
        var ds = jstonkers.utils.DataBuffer.create( data );
        test.equal( ds.readString(), 'Test String' );
        test.equal( ds.readString(), 'Good' );
        
        test.done();
    },
});
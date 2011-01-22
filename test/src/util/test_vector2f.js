var testCase = require('nodeunit').testCase;

module.exports = testCase({
    setUp: function (callback) {
        this.queue = jstonkers.utils.createPriorityQueue();
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    

    testCreateWithArgs: function(test) {
        test.expect(2);
        var v = jstonkers.utils.createVector2f( 4, 5 )
        test.equals( v.x, 4 );
        test.equals( v.y, 5);
        test.done();
    },

    testCreateWithArray: function(test) {
        test.expect(2);
        var v = jstonkers.utils.createVector2f( [9,-10] )
        test.equals( v.x, 9 );
        test.equals( v.y, -10 );
        test.done();
    
    },


    testCreateWithString: function(test) {
        test.expect(4);
        var v = jstonkers.utils.createVector2f( "9.8,0.1" )
        test.equals( v.x, 9.8 );
        test.equals( v.y, 0.1 );
    
        v = jstonkers.utils.createVector2f( "256.369 -0.0005" );
        test.equals( v.x, 256.369 );
        test.equals( v.y, -0.0005 );
    
        test.done();
    },

    testCreateWithVector: function(test) {
        var v = jstonkers.utils.createVector2f( "12, -16" );
        var v2 = jstonkers.utils.createVector2f( v );
    
        test.equals( v.x, v2.x );
        test.equals( v.y, v2.y );
    
        test.done();
    },

    testToString: function(test) {
        var v = jstonkers.utils.createVector2f("-45.6 ,  -0.001");
        var str = v.toString();
        var v2 = jstonkers.utils.createVector2f( str );
    
        test.expect(2);
    
        test.equals( v2.x, v.x );
        test.equals( v2.y, v.y );
    
        test.done();
    },


    testEquality: function(test) {
        var v = jstonkers.utils.createVector2f( 1, 2 );
        var v2 = jstonkers.utils.createVector2f( 1, 2 );
        var v3 = jstonkers.utils.createVector2f( 3, 2 );

        test.expect(2);
    
        test.equals( true, v.isEqual(v2) );
        test.equals( false, v.isEqual(v3) );

        test.done();
    },
    
    testNormal: function(test) {
        
        var v = jstonkers.utils.createVector2f( 10, 0 );
        
        v.normalise();
        
        test.equals(v.x,1);
        test.equals(v.y,0);
        
        v = jstonkers.utils.createVector2f( -15, 5 );
        
        v.normalise();
        
        test.equals(v.x,-0.9486832980505138);
        test.equals(v.y, 0.31622776601683794);
        
        v = jstonkers.utils.createVector2f( 5, -12 );
        
        test.equals( v.normaliseR(6).x, 30 );
        test.equals( v.normaliseR(6).y, -72 );
        
        test.done();
    },
    
    testClone: function( test ) {
        
        var v = jstonkers.utils.createVector2f( 10, -6 );
        
        test.equals( v.clone().x, 10 );
        test.equals( v.clone().y, -6 );
        
        test.done();
    },

    testSubtraction: function(test) {
        var v = jstonkers.utils.createVector2f( 10, 5 );
        var v2 = jstonkers.utils.createVector2f( 2, 6 );
        
        // console.log( v.sub(v2) );
        
        test.equals( v.sub(v2).x, 8 );
        test.equals( v.y, -1 );
        
        test.equals( v.subR(v2).x, 6 );
        test.equals( v.subR(v2).y, -7 );
        
        test.done();
    },
    
    testAddition: function(test) {
    },

    testNormalise: function(test) {    
    },

    testLength: function(test) {
    
    }

});

var Vector2f = require('jstonkers').utils.Vector2f;

exports.testCreateWithArgs = function(test)
{
    test.expect(2);
    var v = Vector2f.create( 4, 5 )
    test.equals( v.x, 4 );
    test.equals( v.y, 5);
    test.done();
};

exports.testCreateWithArray = function(test){
    test.expect(2);
    var v = Vector2f.create( [9,-10] )
    test.equals( v.x, 9 );
    test.equals( v.y, -10 );
    test.done();
    
};


exports.testCreateWithString = function(test)
{
    test.expect(4);
    var v = Vector2f.create( "9.8,0.1" )
    test.equals( v.x, 9.8 );
    test.equals( v.y, 0.1 );
    
    v = Vector2f.create( "256.369 -0.0005" );
    test.equals( v.x, 256.369 );
    test.equals( v.y, -0.0005 );
    
    test.done();
};


exports.testToString = function(test)
{
    var v = Vector2f.create("-45.6 ,  -0.001");
    var str = v.toString();
    var v2 = Vector2f.create( str );
    
    test.expect(2);
    
    test.equals( v2.x, v.x );
    test.equals( v2.y, v.y );
    
    test.done();
}


exports.testEquality = function(test)
{
    var v = Vector2f.create( 1, 2 );
    var v2 = Vector2f.create( 1, 2 );
    var v3 = Vector2f.create( 3, 2 );

    test.expect(2);
    
    test.equals( true, v.equals(v2) );
    test.equals( false, v.equals(v3) );

    test.done();
}

exports.testAddition = function(test)
{   
}

exports.testNormalise = function(test)
{    
}

exports.testLength = function(test)
{
    
}


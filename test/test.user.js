require( '../src/common' );
require( '../src/main.server' );


describe('User', function(){

    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    

    

});
require( '../src/common' );
require( '../src/main.server' );


describe('Unit', function(){

    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });



    describe('creation',function(){

    });


    describe('movement',function(){

        it('should create a movement plan', function(){

        });
    });  

});
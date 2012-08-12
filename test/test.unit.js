require( '../src/common' );
require( '../src/main.server' );


describe('Unit', function(){

    after(function(){
        for (var key in Object.keys(require.cache)){ delete require.cache[key]; }
    });
    
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
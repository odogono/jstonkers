require( '../src/common' );
require( '../src/main.server' );

var User = require( Common.path.join(Common.paths.entities,'user') );


describe('User', function(){

    
    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });


    describe('create', function(){
        it('should create a new user', function(done){
            var userId;
            Step(
                function(){
                    User.create().saveCB( this );    
                },
                function(err,result){
                    if( err ) throw err;
                    userId = result.id;
                    User.retrieveById( userId, this );
                },
                function(err,result){
                    if( err ) throw err;
                    // print_var( result );
                    assert.equal( userId, result.id );
                    done();
                }
            );
        });
    });
    

    

});
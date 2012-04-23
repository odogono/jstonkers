var Common = require( '../src/common.js' );

describe('Game', function(){
    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){
        it('should create a new game', function(){
            Backbone.Model.prototype.should = Object.prototype.should;
            var game = Common.entity.create( 'game.001' );
            
            assert( game instanceof Common.entity.Base );
            Common.should.exist( game.teams );
            game.type.should.equal( Common.entity.TYPE_GAME );
            game.teams.length.should.equal(0);
            Common.should.not.exist( game.map );
        });
    });

});
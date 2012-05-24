var Common = require( '../src/common.js' );


Common.entity.registerEntity('team');
Common.entity.registerEntity('game');
// print_ins( Common.entity );

describe('Game', function(){
    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){
        it('should create a new game', function(){
            // Backbone.Model.prototype.should = Object.prototype.should;
            // print_ins( Common.entity.Game );
            var game = Common.entity.create( 'game.001' );
            
            assert( game instanceof Common.entity.Entity );
            assert( game.teams );
            assert.equal( game.type, Common.entity.TYPE_GAME );
            assert.equal( game.teams.length, 0 );
            assert( !game.map );
            // Common.should.exist( game.teams );
            // game.type.should.equal( Common.entity.TYPE_GAME );
            // game.teams.length.should.equal(0);
            // Common.should.not.exist( game.map );
        });
    });

});
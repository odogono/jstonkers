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
            var game = Common.entity.create( Common.entity.TYPE_GAME );
            
            assert( game instanceof Common.entity.Entity );
            assert( game.teams );
            assert.equal( game.type, Common.entity.TYPE_GAME );
            assert.equal( game.teams.length, 0 );
            assert( !game.map );
        });
    });

});
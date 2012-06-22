require( '../src/common' );
require( '../src/main.server' );


describe('GameManager', function(){
    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){
        it('should create a new game', function(done){
            var game, added = false;
            var gameManager = Common.entity.GameManager.create(null,{
                statePath:Common.path.join( Common.paths.data, 'states', 'game_manager.json')
            });

            gameManager.on('add', function(game){
                added = true;
            });
            
            Step(
                function(){
                    gameManager.createGame( this );
                },
                function(err,result){
                    if(err) throw err;
                    assert( !result.isNew() );
                    assert( added );
                    assert.equal( gameManager.getGame(result.id).id, result.id );
                    done();
                }
            );
        });

        it('should destroy a game', function(done){
            var game, removed = false;
            var gameManager = Common.entity.GameManager.create(null,{
                statePath:Common.path.join( Common.paths.data, 'states', 'game_manager.json')
            });

            gameManager.on('remove', function(game){
                removed = true;
            });
            
            Step(
                function(){
                    gameManager.createGame( this );
                },
                function(err,result){
                    assert.equal( gameManager.games.length, 1 );
                    gameManager.destroyGame( result.id, this );
                },
                function(err,result){
                    if(err) throw err;
                    assert.equal( gameManager.games.length, 0 );
                    assert( removed );
                    done();
                }
            );
        });
    });

});
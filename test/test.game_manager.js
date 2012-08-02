require( '../src/common' );
require( '../src/main.server' );


describe('GameManager', function(){
    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){

        it('should restore from a state', function(){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_manager_a.json');
            var gameManager = jstonkers.entity.GameManager.create(null,{statePath:statePath});

            assert.equal( gameManager.getGame("game.001").get('description'), 'restored test game a');
            // print_var( gameManager.games.flatten({toJSON:true}) );
            // print_var( gameManager );
        });

        /*it('should create a new game', function(done){
            var game, added = false;
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_manager.json');
            var gameManager = jstonkers.entity.GameManager.create(null,{statePath:statePath});

            gameManager.on('add', function(game){
                added = true;
            });
            
            Step(
                function(){
                    gameManager.createGame( null, this );
                },
                function(err,result){
                    if(err) throw err;
                    assert( !result.isNew() );
                    assert( added );
                    assert.equal( gameManager.getGame(result.id).id, result.id );
                    // print_var( gameManager.flatten({toJSON:true}) );
                    // print_var( gameManager.toJSON() );
                    done();
                }
            );
        });//*/

        /*it('should destroy a game', function(done){
            var game, removed = false;
            var gm = jstonkers.entity.GameManager.create(null,{
                statePath:Common.path.join( Common.paths.data, 'states', 'game_manager.json')
            });

            gm.on('remove', function(game){
                removed = true;
            });
            
            Step(
                function(){
                    gm.createGame( null, {debug:true}, this );
                },
                function(err,game){
                    if( err ) throw err;
                    assert.equal( gm.games.length, 1 );
                    // print_var( game.flatten({toJSON:true}) );
                    gm.destroyGame( game.id, this );
                },
                function(err,result){
                    if(err) throw err;
                    assert.equal( gm.games.length, 0 );
                    assert( removed );
                    done();
                }
            );
        });//*/
    });

});
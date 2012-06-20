require( '../src/common' );
require( '../src/main.server' );

describe('Game', function(){
    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){
        it('should create a new game', function(done){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );
            var game = Common.entity.Game.create(null,{statePath:statePath});
            
            assert( game instanceof Common.entity.Entity );
            assert( game.teams );
            assert.equal( game.type, Common.entity.TYPE_GAME );
            assert.equal( game.teams.length, 2 );

            Step(
                function(){
                    game.process(this);
                },
                function(){
                    game.saveCB(null,function(err,result){
                        done();
                    });        
                }
            );
        });

        it('should execute a game function', function(done){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );
            var game = Common.entity.Game.create(null,{statePath:statePath});
            var processed = false;

            var SaveCommand = Common.entity.CommandQueue.Command.extend({
                execute: function(options,callback){
                    processed = true;
                    callback( null, true, this );
                }
            });

            game.cmds.add( new SaveCommand() );
            Step(
                function(){
                    game.process(this);
                },
                function(err){
                    if(err) throw err;
                    assert( processed );
                    game.onStart();
                    done();
                }
            );
        })
    });
});
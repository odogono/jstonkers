var Common = require( '../src/common' );

Common.entity.registerEntity('unit');
Common.entity.registerEntity('team');
var Game = Common.entity.registerEntity('game');

var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

_.extend( Game.entity.prototype, require('../src/entity/game.logic').functions );

// load commands
require( Common.paths.commands );

// print_ins(Common.entity);

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

            var SaveCommand = CommandQueue.Command.extend({
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
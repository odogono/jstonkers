require( '../src/common' );
require( '../src/main.server' );

var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );

describe('Game', function(){

    
    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('create', function(){

        it('should create teams with indexes set', function(){
            var game = jstonkers.entity.Game.create(null,{statePath:statePath});
            assert.equal( game.teams.at(0).get('game').id, game.id );
            assert.equal( game.teams.at(0).get('teamIndex'), 0 );
            assert.equal( game.teams.at(1).get('teamIndex'), 1 );
            log('ok')
        })

        /*it('should create a new game', function(done){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );
            var game = jstonkers.entity.Game.create(null,{statePath:statePath});
            
            assert( game instanceof jstonkers.entity.Entity );
            assert( game.teams );
            assert.equal( game.type, jstonkers.entity.TYPE_GAME );
            assert.equal( game.teams.length, 2 );
            Step(
                function(){
                    game.process(this);
                },
                function(){
                    game.saveRelatedCB(this);
                },
                function(err,result){
                    if( err ) throw err;
                    // print_var( game );
                    jstonkers.entity.Game.create({id:result.id}).fetchRelatedCB({debug:false},this);
                },
                function(err,result){
                    if( err ) throw err;
                    // print_var( result );
                    assert.equal( result.type, jstonkers.entity.TYPE_GAME );
                    assert.equal( result.teams.length, 2 );                    
                    done();
                }
            );
        });//*/

    });

    describe('commands', function(){
        
        it('should execute a game function', function(done){
            var game = jstonkers.entity.Game.create(null,{statePath:statePath});
            var processed = false;

            var SaveCommand = jstonkers.entity.CommandQueue.Command.extend({
                execute: function(options,callback){
                    processed = true;
                    callback( null, true, this );
                }
            });

            game.cmds.add( new SaveCommand() );
            Step(
                function(){
                    game.process(1,this);
                },
                function(err){
                    if(err) throw err;
                    assert( processed );
                    game.onStart();
                    done();
                }
            );
        });//*/

        it.only('should execute a unit movement', function(done){
            var finished = false;
            var game = Entity.Game.create(null,{statePath:statePath});
            var user = Entity.User.create({id:'user.test'});

            game.moveUnit( user, 'ship_1', [20,10] );

            assert.equal( game.cmds.length, 1, 'a move command should have been added' );

            game.on('unit:arrive', function(game,){
                finished = true;
            });

            while( !finished ){
                game.process( 1 );
            }

            done();
        });

    });

    describe('user handling', function(){
        it('should add and remove a user from a team', function(done){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );
            var game = jstonkers.entity.Game.create(null,{statePath:statePath});

            var user = jstonkers.entity.User.create({id:'user.001'});

            // game.on('all',function(){
            //     log('game evt ' + JSON.stringify(arguments) );
            // });

            game.addUser(user);
            assert( !game.teams.at(0).isAI() );
            assert( game.isUserInvolved(user) );

            game.addUser(user);
            assert( game.teams.at(1).isAI() );

            game.removeUser( user );
            assert.deepEqual( game.users(), [] );

            done();
        });
    });

    describe('lifecycle', function(){
        // games don't begin with a single player
        it('should start in a dormant state');
        it('should start playing after an interval');
        
    });


    describe('handling of orders', function(){
        it('should reject an order with an invalid game id');
        it('should reject an order with an invalid unit id')
        it('should reject an order from a non-player');
        it('should convert a move order into a command');
        it('should return the order id on completion of a command');
    });

    describe('commands', function(){

    });

});
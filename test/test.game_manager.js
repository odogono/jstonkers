require( '../src/common' );
require( '../src/main.server' );

var emptyStatePath = Common.path.join( Common.paths.data, 'states', 'game_manager.json');
var dummyStatePath = Common.path.join( Common.paths.data, 'states', 'game_manager_a.json');

describe('GameManager', function(){

    after(function(){
        for (var key in Object.keys(require.cache)){ delete require.cache[key]; }
    });
    
    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    /*
    describe('create', function(){

        it('should restore from a state', function(){
            var statePath = Common.path.join( Common.paths.data, 'states', 'game_manager_a.json');
            var gameManager = jstonkers.entity.GameManager.create(null,{statePath:statePath});

            assert.equal( gameManager.getGame("game.001").get('description'), 'restored test game a');
            // print_var( gameManager.games.flatten({toJSON:true}) );
            // print_var( gameManager );
        });


        it('should create a new game', function(done){
            var game, added = false;
            var gameManager = jstonkers.entity.GameManager.create(null,{statePath:emptyStatePath});

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
                    done();
                }
            );
        });





        it('should destroy a game', function(done){
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
        });
    });//*/

    describe('events', function(){
        it('should create a new game with a user', function(done){
            var userA, game, added = false;
            var gameManager = jstonkers.entity.GameManager.create(null,{statePath:emptyStatePath});

            var userJoinedEvent;

            gameManager.on('game.team.user:joined', function(game,team,user){
                // log('received game.team.user-joined event' );
                userJoinedEvent = true;
            });

            gameManager.on('all', function(type){
                log('gm evt ' + type );
            });

            // print_ins( jstonkers.entity );
            Step(
                function(){
                    jstonkers.entity.User.create({name:'user.game'}).saveCB(this);
                },
                function(err,result){
                    if( err ) throw err;
                    userA = result;
                    userA.on('all', function(type){
                        log('user event ' + type);//JSON.stringify(arguments) );
                    })
                    gameManager.createGame( userA, null, this );
                },
                function(err, game){
                    if( err ) throw err;
                    assert.deepEqual( [userA], game.users() );
                    assert( userJoinedEvent );
                    done();
                }
            );            
        });
    });

});
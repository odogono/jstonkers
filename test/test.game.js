var Common = require( '../src/common.js' );

Common.entity.registerEntity('unit');
Common.entity.registerEntity('team');
Common.entity.registerEntity('game');

var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

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
            var game = Common.entity.Game.create();
            var data = require( Common.path.join( Common.paths.data, 'states', 'game_a.json' ) );
            
            data = game.parse(data,null,{parseFor:'game',removeId:true});
            game.set(data);
            print_var( data );

            assert( game instanceof Common.entity.Entity );
            assert( game.teams );
            assert.equal( game.type, Common.entity.TYPE_GAME );
            assert.equal( game.teams.length, 2 );

            game.saveCB(null,function(err,result){
                // print_ins(arguments);
                done();
            });
        });
    });
});
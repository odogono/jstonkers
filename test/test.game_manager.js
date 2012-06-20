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
            var gameManager = Common.entity.GameManager.create(null,{
                statePath:Common.path.join( Common.paths.data, 'states', 'game_manager.json')
            });

            gameManager.on('add', function(game){
                // log('gm evt ' + evt);
                // print_ins( arguments);
                done();
            });
            // print_ins( Common.entity.GameManager );
            var game = gameManager.createGame();
        });
    });

});
var Common = require( '../src/common' ),
    httpRequest = require('./support/http'),
    appPath = Common.path.join(Common.paths.app,'app'),
    parseCookie = require('connect').utils.parseCookie;
var Server = require('../src/main.server');

describe('app', function(){

    beforeEach( function(done){
        var self = this;
        // clear db first
        Common.sync.clear( function(err){
            if( err ) return done(err);

            // create app instance
            self.app = require(appPath);

            done();
        });
    });


    it('creates a new game', function(done){
        var self = this;
        var addedGame;

        self.app.gameManager.on('add', function(game){
            addedGame = game;
        });

        Step(
            function postCreateRequest(){
                httpRequest(self.app)
                    .post('/game/new')
                    .end(this);
            },
            function(res){
                var response = JSON.parse( res.body );
                assert.equal( addedGame.id, response.game_id );
                this();
            },
            function(){
                done();
            }
        );
    });

    it('destroys a game', function(done){
        var self = this;

        self.app.gameManager.on('all', function(evt){
            log('gm evt ' + evt);
        });

        Step(
            function(){
                httpRequest(self.app).post('/game/new').end( this );
            },
            function(res){
                var response = JSON.parse( res.body );
                httpRequest(self.app, res).delete('/game/' + response.game_id).end(this);
            },
            function(res){
                print_ins(res.body);
                log('done deleting');
                // ensure the game has been deleted
                // httpRequest(self.app, res).get('/game/' + response.game_id);
                done();
            }
        );
    });

    /*it('bundles the client', function(done){
        var self = this;
        Step(
            function(){
                httpRequest(self.app).get('/js/jstonkers.js').end(this);
            },
            function(res){
                log( res.body );
                done();
            }
        )
    });//*/
});
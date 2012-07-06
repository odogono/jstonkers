var Common = require( '../src/common' ),
    httpRequest = require('./support/http'),
    appPath = Common.path.join(Common.paths.app,'app'),
    parseCookie = require('connect').utils.parseCookie;
var Server = require('../src/main.server');

describe('app', function(){

    beforeEach( function(done){
        var self = this;
        this.app = require(appPath);

        // clear db first
        Common.sync.clear( function(err){
            if( err ) return done(err);
            Server.initialize(function(){
                done();    
            });
        });
    });

    afterEach( function(done){
        // print_ins( this.app );
        // this.app.httpServer.close();
        done();
    });


    /*
    describe('users', function(){

        it('should create a user instance for a new user', function(done){
            var app = require(appPath);
            Step(
                function(){
                    httpRequest(app).get('/userinit').json().end(this);
                },
                function(res){
                    httpRequest(app,res).get('/userinit').json().end(this);  
                },
                function(res){
                    log( res.body );
                    done();
                }
            );
        });

        it('should follow on', function(done){
            var app = require(appPath);
            Step(
                function(){
                    httpRequest(app).get('/userinit').json().end(this);
                },
                function(res){
                    log( res.body );
                    done();
                }
            );
        });
    });//*/


    describe('game management', function(){
        it('creates a new game', function(done){
            var self = this;
            var addedGame;

            log( self.app );

            // self.app.gameManager.on('add', function(game){
            //     addedGame = game;
            // });

            Step(
                function postCreateRequest(){
                    httpRequest(self.app)
                        .post('/games/new')
                        .end(this);
                },
                function(res){
                    var response = JSON.parse( res.body );
                    assert.equal( addedGame.id, response.game_id );
                    this();
                },
                function(){
                    log('----')
                    done();
                }
            );
        });
        /*
        it('destroys a game', function(done){
            var self = this;
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
        });//*/

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
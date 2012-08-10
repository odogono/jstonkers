var Common = require( '../src/common' ),
    request = require('supertest'),
    appPath = Common.path.join(Common.paths.app,'app'),
    utils = require('./support/utils');
var Server = require('../src/main.server');

Common.config.server.manualStart = true;
Common.config.socketio.enabled = false;
Common.config.client.browserify = false;

var app = require(appPath);


describe('app', function(){

    /*beforeEach( function(done){
        log('beforeEach');
        var self = this;
        this.app = require(appPath);

        // clear db first
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            Server.initialize(function(){
                done();    
            });
        });
    });//*/

    afterEach( function(done){
        // print_ins( this.app );
        // this.app.httpServer.close();
        done();
    });

    describe('game management', function(){

        it('creates a new game', function(done){
            
            var serverOptions = { statePath:Common.path.join( Common.paths.data, 'states', 'game_manager_a.json') };

            Step(
                function clearDB(){
                    jstonkers.sync.clear(this);
                },
                function (){
                    app.start(serverOptions, this);
                },
                function(err,res){
                    request(app)
                        .post('/games/new')
                        .json()
                        .end(this);
                },
                function(err,res){
                    if( err ) throw err;
                    var gameId = res.body.result.game_id;

                    assert( res.body.result.game_id );
                    assert.equal( res.body.result.status, jstonkers.Status.ACTIVE );
                    assert.equal( res.body.result.game_count, 2 );
                    request(app)
                        .get('/games/' + gameId )
                        .json()
                        .setCookies(res)
                        .end(this);//*/
                },
                function(err,res){
                    if( err ) throw err;
                    // print_var(res.body);
                    app.stop( done );
                }
            );
        });

        /*
        it('returns details of current games', function(done){
            
            var serverOptions = { statePath:Common.path.join( Common.paths.data, 'states', 'game_manager_a.json') };

            Step(
                function clearDB(){
                    jstonkers.sync.clear(this);
                },
                function (){
                    app.start(serverOptions, this);
                },
                function(){
                    request(app).get('/games').set('Accept', 'application/json').end(this);
                },
                function(err,res){
                    if( err ) throw err;
                    print_var(res.body);
                    app.stop( done );
                }
            );
        });//*/

    /*
        it('app start/stop 2', function(done){
            log('----');
            Common.config.server.manualStart = true;
            var app = require( appPath );
            var serverOptions = { statePath:Common.path.join( Common.paths.data, 'states', 'game_manager_a.json') };

            Step(
                function clearDB(){
                    jstonkers.sync.clear(this);
                },
                function startApp(){
                    app.start(serverOptions, this);
                },
                function(err){
                    if( err ) throw err;
                    log('started');
                    app.stop(this);
                },
                function(err){
                    // if( err ) throw err;
                    log('stopped');
                    done();
                }
            );
        });//*/

        /*it('creates a new game', function(done){
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
        });//*/

        

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
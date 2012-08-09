var Common = require( '../src/common' ),
    request = require('supertest'),
    appPath = Common.path.join(Common.paths.app,'app'),
    // parseCookie = require('connect').utils.parseCookie,
    utils = require('./support/utils'),
    io = require('socket.io/node_modules/socket.io-client');
var Server = require('../src/main.server');

Common.config.server.manualStart = true;
Common.config.socketio.enabled = true;
Common.config.client.browserify = false;
var socketOptions = { transports: ['websocket'], 'force new connection': true };
var app = require(appPath);


describe('realtime', function(){

    beforeEach( function(done){
        // app = require(appPath);
        // app.start( null, done );
        done();
    //     var self = this;
    //     // clear db first
    //     jstonkers.sync.clear( function(err){
    //         if( err ) return done(err);
    //         Server.initialize(function(){
    //             done();    
    //         });
    //     });
    });

    describe('stuff', function(){

        it('should connect', function(done){
            var sessionRequest;
            var serverOptions = { statePath:Common.path.join( Common.paths.data, 'states', 'game_manager_a.json') };
            Step(
                function clearDB(){
                    jstonkers.sync.clear(this);
                },
                function (){
                    app.start(serverOptions, this);
                },
                function(){
                    // request a token so we can sio connect
                    request(app).get('/').end(this);
                },
                function(err,res){
                    if( err ) throw err;
                    var time, next = this;
                    // store the response for use in later requests
                    // log( 'sioToken: ' + res.headers.siotoken );
                    // print_ins( res.headers );
                    sessionRequest = res;
                    var addr = 'http://127.0.0.1:' + app.config.server.port + '?siotoken=' + res.headers.siotoken;

                    io.connect(addr).on('connect', function(data){
                        // this.emit('set', 'name', 'boris' );
                        this.emit('ping', (time = Date.now()), function pong(time){
                            log('roundtrip ' + (Date.now()-time) );
                            this.disconnect();
                            next();
                        });
                    });
                },
                // function(err){
                //     if( err ) throw err;
                //     request(app)
                //         .get('/session')
                //         .send({ get: 'name' })
                //         // set cookies we received from earlier request to maintain the session
                //         .setCookies(sessionRequest)
                //         .end(this);
                // },
                function(err,res){
                    if( err ) throw err;
                    // assert.equal( res.body.name, 'boris');
                    app.stop( done );
                }
            );
        });

    /*
        it('should connect', function(done){
            var client1;
            var serverOptions = { statePath:Common.path.join( Common.paths.data, 'states', 'game_manager_a.json') };

            log('starting?');
            Step(
                function clearDB(){
                    jstonkers.sync.clear(this);

                },
                function startApp(){
                    app.start(serverOptions, this);
                },
                function(err){
                    var next = this;
                    if( err ) throw err;
                    log('started');

                    client1 = io.connect('http://127.0.0.1:' + Common.config.server.port, socketOptions );

                    client1.on('connect', function(data){
                        log('connected!');
                        client1.emit('msg', {name:'conn.001'} );
                    }).on('message', function(data){
                        log( 'message recv: ' + JSON.stringify(arguments) );
                        next();
                    });
                },
                function(err){
                    app.stop(this);
                },
                function(){
                    if( err ) throw err;
                    log('stopped');
                    done();
                }
            );
        });//*/

    });
});
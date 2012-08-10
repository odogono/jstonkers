process.env.DEBUG = 'client.*';

var Common = require( '../src/common' ),
    request = require('supertest'),
    appPath = Common.path.join(Common.paths.app,'app'),
    // parseCookie = require('connect').utils.parseCookie,
    utils = require('./support/utils'),
    Server = require('../src/main.server');


io = require('socket.io/node_modules/socket.io-client');

// debug.enable('client.*');


jstonkers.client = jstonkers.client || {};
require('../src/client/server_comms');

Common.config.server.manualStart = true;
Common.config.socketio.enabled = true;
Common.config.client.browserify = false;

var app = require(appPath);
var socketOptions = { transports: ['websocket'], 'force new connection': true };



describe('client.server_comms', function(){

    beforeEach( function(done){
        done();
    });

    after(function(){
        for (var key in Object.keys(require.cache)){ delete require.cache[key]; }
    });

    describe('stuff', function(){

        it('should connect', function(done){
            var serverComms;
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
                    request(app)
                        .get('/')
                        .json()//.set('Accept', 'application/json')
                        .end(this);
                },
                function(err,res){
                    if( err ) throw err;
                    var time, next = this;
                    sessionRequest = res;
                    serverComms = new jstonkers.client.ServerComms(res.body.server);
                    serverComms.connect({},function(err){
                        // print_ins( this );
                        this.disconnect();
                        next();
                    });
                },
                function(err,res){
                    if( err ) throw err;
                    // assert.equal( res.body.name, 'boris');
                    app.stop( done );
                }//*/
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
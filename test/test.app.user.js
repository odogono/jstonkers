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

    after(function(){
        for (var key in Object.keys(require.cache)){ delete require.cache[key]; }
    });
    
    beforeEach( function(done){
        var self = this;

        // clear db first
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            Server.initialize(function(){
                done();    
            });
        });
    });

    /*
    describe('users', function(){
        it('should follow on', function(done){
            var app = require(appPath);
            Step(
                function(){
                    request(app).get('/userinit').json().end(this);
                },
                function(res){
                    // print_ins( arguments );
                    // log( res.body );
                    log('followed up')
                    done();
                }
            );
        });
    });//*/
});
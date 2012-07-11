var Common = require( '../src/common' ),
    httpRequest = require('./support/http'),
    appPath = Common.path.join(Common.paths.app,'app'),
    parseCookie = require('connect').utils.parseCookie;
var Server = require('../src/main.server');

describe('app', function(){

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

    describe('users', function(){
        it('should follow on', function(done){
            var app = require(appPath);
            Step(
                function(){
                    httpRequest(app).get('/userinit').json().end(this);
                },
                function(res){
                    log( res.body );
                    log('followed up')
                    done();
                }
            );
        });
    });
});
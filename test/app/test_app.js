require('../common');
var testCase = require('nodeunit').testCase;
var fs = require('fs');

var app = require( path.join( app_paths.app, 'app') );


module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testBasic: function(test) {
        var ws = jstonkers.utils.createSocketIOClient('localhost', {port:app.config.server.port} );
        
        ws.on('message', function (msg) {
          console.log('a new message came in: ' + JSON.stringify(msg));
        });
        
        ws.on('connect', function() { 
           ws.send({msg:'can i play'});
        });
        ws.on('disconnect', function() {
           console.log('disconnected'); 
        });
        ws.addListener('wserror', function(err) {
            console.log('error ! ' + err );
        });
        ws.connect();
        
        // ws.send( 'testing', 'hello there');
    },
});
require('../common');
var testCase = require('nodeunit').testCase;
var fs = require('fs');
// var CouchDB = require('jstonkers').utils.CouchDB;

var app = require( path.join(dir_app, 'app') );
// var SocketIOClient = require('socket.io/client');
// log( inspect( require.paths ) );
log(inspect(jstonkers.utils.SocketIOClient));

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    // testCreate: function(test) {        
    //     test.equals( this.cdb.url, 'http://localhost:5984' );        
    //     
    //     this.cdb = new CouchDB.create( {url:'http://server:5984'} );
    //     test.equals( this.cdb.url, 'http://server:5984' );
    //     
    //     test.done();
    // },
    
    testBasic: function(test) {
        // var ws = new WebSocket('ws://localhost:3000/socket.io/websocket', 'com.opendoorgonorth.stonkers');
        var ws = new jstonkers.utils.SocketIOClient('localhost', {port:3000} );
        // var ws = new WebSocket('ws://localhost:8000/biff', 'borf');
        // ws.addListener('data', function(buf) {
        //     log('Got data: ' + inspect(buf));
        // });
        
        // ws.on('message', function(m) {
        //     log('Got message: ' + m );
        //     ws.send('thanks ants');
        // });
        
        ws.on('message', function (msg) {
          console.log('a new message came in: ' + JSON.stringify(msg));
        });
        
        // ws.addListener('open', function() {
        //     console.log("opened connection");
        //     // ws.send(encode('from client'));
        //     // ws.send('This is a message', 1);
        // });
        ws.on('connect', function() { 
           ws.send({msg:'can i play'});
        });
        ws.on('disconnect', function() {
           console.log('disconnected yo'); 
        });
        ws.addListener('wserror', function(err) {
            console.log('error ! ' + err );
        });
        ws.connect();
        
        // ws.send( 'testing', 'hello there');
    },
});
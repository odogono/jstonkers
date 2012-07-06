
/**
 * Module dependencies.
 */
var Common = require( '../../src/common' );

var EventEmitter = require('events').EventEmitter
    , methods = express.methods
    , http = require('http')
    , assert = require('assert');

module.exports = request;

function request(app, res) {
    return new Request(app,res);
}

function Request(app, res) {
    var self = this;
    this.data = [];
    this.header = {};
    this.app = app;
    
    if (!this.server) {
        this.server = http.Server(app);
        this.server.listen(0, function(){
            self.addr = self.server.address();
            self.listening = true;
        });
    }
    if( res && res.headers ){
        _.each( res.headers['set-cookie'], function(cookie){
            // log('setting cookie ' + cookie);
            self.set('Cookie', cookie );
        });
    }
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

methods.forEach(function(method){
  Request.prototype[method] = function(path){
    return this.request(method, path);
  };
});

Request.prototype.set = function(field, val){
  this.header[field] = val;
  return this;
};

Request.prototype.write = function(data){
  this.data.push(data);
  return this;
};

/**
*   Sets up a json write - stringifies the data
*/
Request.prototype.json = function(data){
    this.set('Content-Type', 'application/json');
    if( data )
        this.write( JSON.stringify(data) );    
    return this;
};

Request.prototype.request = function(method, path){
  this.method = method;
  this.path = path;
  return this;
};

Request.prototype.expectFields = function(body,fn){
    this.end( function(res){
        var jsonBody = JSON.parse( res.body );
        _.each(body, function(v,k){
            v.should.eql( jsonBody[k], k + ' should be ' + v );
        })
        fn();
    });
};

Request.prototype.expect = function(body, fn){
    this.end(function(res){
        // log( 'checking ' + JSON.stringify(body) + ' against ' + JSON.stringify(res.body) );
        if ('number' == typeof body) {
            res.statusCode.should.equal(body);
        } else if (body instanceof RegExp) {
            res.body.should.match(body);
        } else if( _.isObject(body) ) {
            JSON.parse(res.body).should.eql(body);
        } else {
            res.body.should.equal(body);
        }
        fn();
    });
};

Request.prototype.end = function(fn){
    var self = this;
    if (this.listening) {
        // log('performing request for ' + this.method + ' ' + this.addr.port + ' ' + this.path );
        var req = http.request({
            method: this.method
            , port: this.addr.port
            , host: this.addr.address
            , path: this.path
            , headers: this.header
        });

        this.data.forEach(function(chunk){
            req.write(chunk);
        });
    
        req.on('response', function(res){
            var buf = '';
            res.setEncoding('utf8');
            res.on('data', function(chunk){ buf += chunk });
            res.on('end', function(){
                res.body = buf;
                fn(res);
            });
        });

        req.end();
    } else {
        this.server.on('listening', function(){
            self.end(fn);
        });
    }

    return this;
};
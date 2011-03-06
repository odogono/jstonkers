/**
   Extension for JS Connect
   Copyright(c) 2011 open door go north
   MIT Licensed
 */

/**
   Module dependencies.
 */

var sys = require('sys'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    Store = require('connect').middleware.session.Store;

/**
   Initialize FileSessionStore with given `opts`.

   @param {Object} opts Options.
   @api public
 */
var FileSessionStore = module.exports = function FileSessionStore(opts) {
    opts = opts || {};
    Store.call(this, opts);

    // define default session store directory
    this.prefix = opts.prefix || 'file-store-';
    this.path = opts.path || process.env.TMPDIR;

    // set default reapInterval to 10 minutes
    this.reapInterval = opts.reapInterval || 600000;

    // interval for reaping stale sessions
    if (this.reapInterval !== -1) {
        setInterval(function (self) {
            self.reap(self.maxAge);
        }, this.reapInterval, this);
    }
};

sys.inherits(FileSessionStore, Store);

/**
   Reap sessions older than `ms` milliseconds.

   @param {Number} ms Milliseconds threshold.
   @api private
 */
FileSessionStore.prototype.reap = function (ms) {
    var threshold = + new Date() - ms;
    var self = this; // store 'this' object
    
    this.redis.sendCommand('keys', this.prefix + '*', function (err, keys) {
        for (k in keys) {
            var sid = keys[k].toString();
            // try to remove keys one by one if lastAccess < threshold
            self.redis.sendCommand('get', sid, function (err, val) {
                if (err === null) {
                    val = JSON.parse(val);
                    if (val.lastAccess < threshold) {
                        self.redis.sendCommand('del', sid);
                    }
                }
            });
        }
    });
};

/**
   Attemp to fetch sessin by the given `sid`.

   @param {String} sid Session ID.
   @param {Function} fn Function, that called after get.
   @api public
 */
FileSessionStore.prototype.get = function(sid, fn) {
    var filePath = path.join( this.path, sid );
    fn = fn || function () {};
    path.exists( filePath, function (exists) {
        if( exists ){
            fs.readFile( filePath, function (err, data) {
              if (err){ 
                  fn();
              }else{
                  fn( null, JSON.parse(data) );
              }
            });
        } else{
            fn();
        }
    });
};

/**
   Commit the given `sess` object associated with the given `sid`.

   @param {String} sid Session ID.
   @param {Session} sess Session values.
   @param {Function} fn Function, that called after set.
   @api public
 */
FileSessionStore.prototype.set = function (sid, sess, fn) {
    console.log('set [' + sid + '] = ' + JSON.stringify(sess));
    // fn = fn || function () {};
    // this.redis.sendCommand('set', this.prefix + sid, JSON.stringify(sess), fn);
    
    var content = JSON.stringify(sess);
    var filePath = path.join( this.path, sid );
    fs.writeFile( filePath, content, function(err){
        fn && fn();
    });
};

/**
   Destroy the session associated with the given `sid`.

   @param {String} sid Session ID.
   @param {Function} fn Function, that called after value delete.
   @api public
 */
FileSessionStore.prototype.destroy = function (sid, fn) {
    var filePath = path.join( this.path, sid );
    fn = fn || function () {};
    
    path.exists( filePath, function (exists) {
        if( exists ){
            fs.unlink( filePath, function (err, data) {
                  fn();
            });
        } else{
            fn();
        }
    });
    
    this.redis.sendCommand('del', this.prefix + sid, fn);
};

/**
   Invoke the given callback `fn` with all active sessions.
   Method wasn't tested!

   @param {Function} fn Function that applyed to all active sessions.
   @api public
 */
FileSessionStore.prototype.all = function (fn) {
    fn = fn || function () {};
    // this.redis.sendCommand('keys', this.prefix + '*', fn);
};

/**
   Clear all sessions.

   @param {Function} fn Function, that calls after removing all sessions.
   @api public
 */
FileSessionStore.prototype.clear = function (fn) {
    fn = fn || function () {};
    var self = this;
    fs.readdir( this,path, function(err, files){
        files.each( function(f){
            
        });
    });
    
    // this.redis.sendCommand('keys', this.prefix + '*', function (err, keys) {
    //     var arr = ['del'];
    //     for (k in keys) {
    //         arr.push(keys[k].toString());
    //     }
    //     self.redis.sendCommand.apply(self.redis, arr, fn);
    // });
};

/**
   Fetch number of sessions.

   @param {Function} fn Function, that accepts number of sessions.
   @api public
 */
FileSessionStore.prototype.length = function (fn) {
    fn = fn || function () {};
    console.log('get length');
    // this.redis.sendCommand('keys', this.prefix + '*', function (err, keys) {
    //     if (keys !== 'nil') {
    //         fn(null, keys.length);
    //     } else {
    //         fn();
    //     }
    // });
};
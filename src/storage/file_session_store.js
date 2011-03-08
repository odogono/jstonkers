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
    crypto = require('crypto'),
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
    this.filePattern = new RegExp( '^' + this.prefix + '.*' );
    this.path = opts.path || process.env.TMPDIR;
    // log(inspect(opts));
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
    var val, filePath;
    
    // TODO AV : check the files we are reading match the prefix and are not directories
    
    fs.readdir( self.path, function(err, files){
        if( files.length <= 0 ){
            fn(null,result);
            return;
        }
        files.forEach(function(f,i){
            if( !self.filePattern.exec(f) )
                return;
            filePath = path.join(self.path,f);
            fs.readFile( filePath, function (err, data) {
                if( err == null ){
                    val = JSON.parse(data);
                    if (val.lastAccess < threshold) {
                        fs.unlink( filePath );
                    }
                }
            });
        });
    });
};

/**
   Attemp to fetch sessin by the given `sid`.

   @param {String} sid Session ID.
   @param {Function} fn Function, that called after get.
   @api public
 */
FileSessionStore.prototype.get = function(sid, fn) {
    var fileName = this.prefix + crypto.createHash('md5').update(sid).digest('hex');
    var filePath = path.join( this.path, fileName );
    fn = fn || function () {};
    // console.log('get [' + sid + ']');
    path.exists( filePath, function (exists) {
        if( exists ){
            fs.readFile( filePath, function (err, data) {
                if(err){
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
    var fileName = this.prefix + crypto.createHash('md5').update(sid).digest('hex');
    // console.log('set [' + sid + '] = ' + JSON.stringify(sess));
    
    var content = JSON.stringify(sess);
    var filePath = path.join( this.path, fileName );
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
    var fileName = this.prefix + crypto.createHash('md5').update(sid).digest('hex');
    var filePath = path.join( this.path, fileName );
    fn = fn || function () {};
    
    path.exists( filePath, function (exists) {
        if( exists ) {
            fs.unlink( filePath, function (err, data) {
                fn();
            });
        } else{
            fn();
        }
    });
};

/**
   Invoke the given callback `fn` with all active sessions.
   Method wasn't tested!

   @param {Function} fn Function that applyed to all active sessions.
   @api public
 */
FileSessionStore.prototype.all = function (fn) {
    var self = this;
    var result = [];
    fn = fn || function () {};
    
    
    fs.readdir( self.path, function(err, files){
        if( files.length <= 0 ){
            fn(null,result);
            return;
        }
        files.forEach(function(f,i){
            
            if( self.filePattern.exec(f) ){
                fs.readFile( path.join(self.path,f), function (err, data) {
                    if( err == null && data ){
                        result.push( JSON.parse(data) );
                    }
                    if( i >= files.length-1 )
                        fn(null, result);
                });
            }else{
                if( i >= files.length-1 )
                    fn(null, result);
            }
        });
    });
};

/**
   Clear all sessions.

   @param {Function} fn Function, that calls after removing all sessions.
   @api public
 */
FileSessionStore.prototype.clear = function (fn) {
    
    var self = this; // store 'this' object
    var filePath;
    fn = fn || function () {};
    
    fs.readdir( self.path, function(err, files){
        if( files.length <= 0 ){
            fn(null,result);
            return;
        }
        files.forEach(function(f,i){
            filePath = path.join(self.path,f);
            
            if( self.filePattern.exec(f) ){
                // log('deleting ' + filePath );
                fs.unlink( filePath, function (err) {
                    if( i >= files.length-1 )
                        fn();
                });
            }else{
                if( i >= files.length-1 )
                    fn();
            }
        });
    });
    
};

/**
   Fetch number of sessions.

   @param {Function} fn Function, that accepts number of sessions.
   @api public
 */
FileSessionStore.prototype.length = function (fn) {
    var self = this;
    var result = [];
    var result = 0;
    fn = fn || function () {};
    
    fs.readdir( self.path, function(err, files){
        files.forEach( function(f){
            if( self.filePattern.exec(f) ){
                result++;
            }
        })
        fn( null, result );
    });
};
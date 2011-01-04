var sys = require('sys');
var util = require('util');

var PersistentStorage = function (){};

PersistentStorage.prototype = {
    url: 'http://localhost:5984',
    
    // e: function(i) {
    //     return 99;
    // },
    // 
    // add: function(other) {
    //     this.x += other.x;
    //     this.y += other.y;
    // },
    // 
    // toArray: function() {
    //     return [ this.x, this.y ];
    // },
    
    listDBs: function( callback ) {
        // _.bind( callback, this );
        request({ uri: this.url + '/_all_dbs', headers:this.headers }, function (err, response, body) {
            if( err )
                callback( err, null );
            else
                callback( err, JSON.parse(body) );
            // console.log(sys.inspect(JSON.parse(body)));
        });
    },
    
    
    createDB: function( dbName, callback ) {
        var self = this;
        callback = _.bind(callback, this);
        
        request({ uri: this.url + '/' + dbName, method:'PUT', headers:this.headers }, function (err, response, body) {
            if( response.statusCode !== 201 )
                err = JSON.parse(body);
            callback( err, response.statusCode === 201 );
        });
    },
    
    toString: function() {
        return this.url;
    },
    // 
    // equals: function( other ) {
    //     return this.x == other.x && this.y == other.y;
    // }
}

exports.create = function( options ) {
    var db = new PersistentStorage();
    options = options || {};
    
    db.url = options.url || db.url;
    
    return db;
}

exports.info = "persistent storage";
exports.PersistentStorage = PersistentStorage;
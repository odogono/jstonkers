var sys = require('sys');
var util = require('util');

var MatchesCollection = function (){};

MatchesCollection.prototype = {
    
    get: function( resource_id, options ) {
        
    },
    
    set: function( resource_id, data, options ) {
        
    },
    
    clear: function( resource_id, options ) {
        
    },
    
    
    toString: function() {
        return 'Manager';
    },
    
    // 
    // equals: function( other ) {
    //     return this.x == other.x && this.y == other.y;
    // }
}

exports.create = function( options ) {
    var db = new MatchesCollection();
    options = options || {};
    
    return db;
}

exports.info = "collection of matches";
exports.MatchesCollection = MatchesCollection;
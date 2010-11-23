var Vector2f = function (){}

Vector2f.prototype = {
    e: function(i) {
        return 99;
    },
    
    add: function(other) {
        this.x += other.x;
        this.y += other.y;
    },
    
    toArray: function() {
        return [ this.x, this.y ];
    },
    
    toString: function() {
        return this.x + "," + this.y;
    },
    
    equals: function( other ) {
        return this.x == other.x && this.y == other.y;
    }
}

exports.create = function( x, y, z ) {
    var v = new Vector2f();
    var type = Object.prototype.toString.call(x);
    
    if( type === '[object Array]' ) {
        v.x = x[0]; v.y = x[1];
    }
    else if( type == '[object String]' ) {
        var els = x.match( /[\-0-9\.]+/g );
        if( els.length == 2 ) {
            v.x = els[0]; v.y = els[1];
        }
    }
    else {
        v.x = x;
        v.y = y;
    }
    return v;
}

exports.info = "two dimensional vector class";
exports.Vector2f = Vector2f;
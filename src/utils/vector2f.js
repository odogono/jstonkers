var Vector2f = exports.Vector2f = function (x,y){
    this.x = x;this.y = y;
};

Vector2f.prototype = {
    e: function(i) {
        return 99;
    },
    
    add: function(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    },
    
    addR: function(other) {
        return new Vector2f( this.x + other.x, this.y + other.y );
    },
    
    sub: function(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    },
    
    subR: function(other) {
        return new Vector2f( this.x - other.x, this.y - other.y );
    },
    
    toArray: function() {
        return [ this.x, this.y ];
    },
    
    toString: function() {
        return this.x + "," + this.y;
    },
    
    toJSON: function() {
        return [ this.x, this.y ];
    },
    
    isEqual: function(other) {
        return this && other && this.x === other.x && this.y === other.y;
    },
    
    distance: function( other ) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    },
    
    clone: function() {
        return new Vector2f(this.x, this.y);
    },
    
    normalise: function( amount ) {
        var mag = Math.sqrt( (this.x * this.x) + (this.y * this.y) );
        
        if( mag === 0 ){
            this.x = 0; this.y = -1;
            return this;
        }
        this.x = this.x / mag;
        this.y = this.y / mag;
        
        if( amount ) {
            this.x *= amount;
            this.y *= amount;
        }
        return this;
    },
    
    normaliseR: function( amount ) {
        var result = new Vector2f(0,-1);
        var mag = Math.sqrt( (this.x * this.x) + (this.y * this.y) );
        
        if( mag === 0 ){
            return result;
        }
        result.x = this.x / mag;
        result.y = this.y / mag;
        
        if( amount ) {
            result.x = this.x * amount;
            result.y = this.y * amount;
        }
        return result;
    },
}

exports.createVector2f = function( x, y, z ) {
    var v = new Vector2f();
    var type = Object.prototype.toString.call(x);
    
    if( x instanceof Vector2f ){
        v.x = x.x; v.y = x.y;
    }
    else if( type === '[object Array]' ) {
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
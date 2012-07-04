var Vector2f = exports.Vector2f = function (x,y){
    this[0] = x || 0;
    this[1] = y || 0;
};


var isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
};


exports.isAtInfinity = function( v2f ){
    return v2f && isNaN(v2f[0]) && isNaN(v2f[1]);
}

exports.isEqual = function( a, b ){
    if( a === null && b === null )
        return true;
    return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

exports.indexOf = function( list, v ){
    if( list === null || list.length <= 0 )
        return false;
    for( var i=0,len=list.length;i<len;i++ ){
        if( exports.isEqual( list[i], v ) )
            return i;
    }
    return -1;
}


exports.distance = function distance(a,b){
    var x = a[0] - b[0];
    var y = a[1] - b[1];

    return Math.sqrt( x * x + y * y );
}

Vector2f.prototype = {
    e: function(i) {
        return 99;
    },
    
    add: function(other) {
        this[0] += other[0];
        this[1] += other[1];
        return this;
    },
    
    addR: function(other) {
        return new Vector2f( this[0] + other[0], this[1] + other[1] );
    },
    
    sub: function(other) {
        this[0] -= other[0];
        this[1] -= other[1];
        return this;
    },
    
    subR: function(other) {
        return new Vector2f( this[0] - other[0], this[1] - other[1] );
    },
    
    toArray: function() {
        return [ this[0], this[1] ];
    },
    
    toString: function() {
        return this[0] + "," + this[1];
    },
    
    toJSON: function() {
        return [ this[0], this[1] ];
    },
    
    isEqual: function(other) {
        return this && other && this[0] === other[0] && this[1] === other[1];
    },
    
    distance: function( other ) {
        return Math.abs(this[0] - other[0]) + Math.abs(this[1] - other[1]);
    },
    
    clone: function() {
        return new Vector2f(this[0], this[1]);
    },
    
    normalise: function( amount ) {
        var mag = Math.sqrt( (this[0] * this[0]) + (this[1] * this[1]) );
        
        if( mag === 0 ){
            this[0] = 0; this[1] = -1;
            return this;
        }
        this[0] = this[0] / mag;
        this[1] = this[1] / mag;
        
        if( amount ) {
            this[0] *= amount;
            this[1] *= amount;
        }
        return this;
    },
    
    normaliseR: function( amount ) {
        var result = new Vector2f(0,-1);
        var mag = Math.sqrt( (this[0] * this[0]) + (this[1] * this[1]) );
        
        if( mag === 0 ){
            return result;
        }
        result[0] = this[0] / mag;
        result[1] = this[1] / mag;
        
        if( amount ) {
            result[0] = this[0] * amount;
            result[1] = this[1] * amount;
        }
        return result;
    },
}


Vector2f.prototype.__defineGetter__('x', function(){
    return this[0];
});

Vector2f.prototype.__defineSetter__('x',function(x){
    this[0] = x;
});

Vector2f.prototype.__defineGetter__('y', function(){
    return this[1];
});

Vector2f.prototype.__defineSetter__('y',function(y){
    this[1] = y;
});

exports.create = function( x, y, z ) {
    var v = new Vector2f();
    
    if( x instanceof Vector2f ){
        v[0] = x[0]; v[1] = x[1];
    }
    else if( _.isArray(x) ) {
        v[0] = x[0]; v[1] = x[1];
    }
    else if( _.isString(x) ) {
        var els = x.match( /[\-0-9\.]+/g );
        if( els.length == 2 ) {
            v[0] = els[0]; v[1] = els[1];
        }
    }
    else {
        v[0] = x;
        v[1] = y;
    }
    return v;
}
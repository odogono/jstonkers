var FLT_EPSILON = 0.0001;

var Vector2f = exports.Vector2f = function (x,y){
    this[0] = x || 0;
    this[1] = y || 0;
};


var isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
};

_.extend( exports, {
    isAtInfinity: function( v2f ){
        return v2f && isNaN(v2f[0]) && isNaN(v2f[1]);
    },

    isZero: function( v ){
        return v[0] >= -FLT_EPSILON && v[0] <= FLT_EPSILON && 
            v[1] >= -FLT_EPSILON && v[1] <= FLT_EPSILON;
    },

    isEqual: function( a, b ){
        if( a === null && b === null )
            return true;
        return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    },

    indexOf: function( list, v ){
        if( list === null || list.length <= 0 )
            return false;
        for( var i=0,len=list.length;i<len;i++ ){
            if( exports.isEqual( list[i], v ) )
                return i;
        }
        return -1;
    },

    add: function( r, a, b ){
        if( !r )
            r = new Vector2f(0,0);
        if( _.isNumber(b) ){
            r[0] = a[0] + b;
            r[1] = a[1] + b;
        } else if( !b ){
            return r;
        } else {
            r[0] = a[0] + b[0];
            r[1] = a[1] + b[1];
        }
        return r;
    },

    sub: function( r, a, b ){
        if( !r )
            r = new Vector2f(0,0);
        if( _.isNumber(b) ){
            r[0] = a[0] - b;
            r[1] = a[1] - b;
        } else if( !b ){
            return r;
        } else {
            r[0] = a[0] - b[0];
            r[1] = a[1] - b[1];
        }
        return r;
    },

    mul: function( r, a, b ){
        if( !r )
            r = new Vector2f(0,0);
        if( _.isNumber(b) ){
            r[0] = a[0] * b;
            r[1] = a[1] * b;
        } else if( !b ){
            return r;
        } else {
            r[0] = a[0] * b[0];
            r[1] = a[1] * b[1];
        }
        return r;
    },

    dot: function( a, b ){
        return a[0] * b[0] + a[1] * b[1];
    },

    set: function( r, a ){
        if( !r )
            r = new Vector2f(0,0);
        if( _.isNumber(a) ){
            r[0] = a; r[1] = a;
        } else {
            r[0] = a[0];
            r[1] = a[1];
        }
        return r;
    },

    zero: function( r ){
        r[0] = r[1] = 0;
        return r;
    },

    normalise: function( r, a, amount ) {
        if( !r )
            r = new Vector2f(0,-1);

        var mag = Math.sqrt( (a[0] * a[0]) + (a[1] * a[1]) );
        
        if( mag === 0 ){
            return r;
        }
        r[0] = a[0] / mag;
        r[1] = a[1] / mag;
        
        if( amount ) {
            r[0] = r[0] * amount;
            r[1] = r[1] * amount;
        }
        return r;
    },

    truncate: function(r, a, max){
         if( !r )
            r = new Vector2f(0,0);
        var magnitude = Math.sqrt((a[0] * a[0]) + (a[1] * a[1]) );

        if( magnitude > max ){
            r[0] = a[0] / magnitude;
            r[1] = a[1] / magnitude;
            r[0] *= max;
            r[1] *= max;
        }
        return r;
    },

    length: function( a ){
        return Math.sqrt((a[0] * a[0]) + (a[1] * a[1]) );
    },

    lengthSq: function( a ){
        return a[0] * a[0] + a[1] * a[1];
    },

    clamp1f: function( v, min, max ){
        return Math.min( Math.max( v, min ), max );
    },

    toRadians: function(a){
        return a * Math.PI / 180;
    },

    distance: function(a,b){
        var x = a[0] - b[0];
        var y = a[1] - b[1];

        return Math.sqrt( x * x + y * y );
    },

    turnLeft: function( r, a ){
        if( !r )
            r = new Vector2f(0,0);
        r[0] = -a[1];
        r[1] = a[0];
        return r;
    },

    turnRight: function(r,a){
        if( !r )
            r = new Vector2f(0,0);
        r[0] = a[1];
        r[1] = -a[0];
        return r; 
    },

    /**
     * Returns the angle the vector points to
     * @param  {Vector2f} a Vector2f
     * @return {Number}   angle in radians
     */
    angle: function( a ){
        return Math.atan2( a[1], a[0] );
    },

    isEqual: function( a, b) {
        return a && b && a[0] === b[0] && a[1] === b[1];
    },
});

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

    mul: function(other){
        if( _.isNumber(other) ){
            this[0] *= other;
            this[1] *= other;
        } else {
            this[0] *= other[0];
            this[1] *= other[1];    
        }
        return this;
    },

    set: function( other ){
        this[0] = other[0];
        this[1] = other[1];
        return this;
    },
    
    toArray: function() {
        return [ this[0], this[1] ];
    },
    
    toString: function() {
        return this[0].toFixed(3) + "," + this[1].toFixed(3);
    },
    
    toJSON: function() {
        return [ this[0], this[1] ];
    },
    
    isEqual: function(other) {
        return exports.isEqual( this, other );
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

    magnitude: function(){
        return Math.sqrt((this[0] * this[0]) + (this[1] * this[1]) );
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
        v[0] = x || 0;
        v[1] = y || 0;
    }
    return v;
}
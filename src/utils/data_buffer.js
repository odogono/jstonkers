var util = require('util');

var DataBuffer = exports.DataBuffer = function(data){
    this.pos = 0;
    this.data = data;
}

util.inherits(DataBuffer, Buffer);

DataBuffer.prototype = {
    
    testBytes: function( b ){
        for( var i=0;i<b.length;i++ ){
            if( this.data[this.pos+i] != b[i] ){
                return false;
            }
        }
        this.pos += b.length;
        return true;
    },
    
    readInt: function() {
        var result = (this.data[this.pos++]<<24) | (this.data[this.pos++]<<16) | (this.data[this.pos++]<<8) | (this.data[this.pos++]);
        return result;
    },
    
    readString: function(len) {
        var result, i;
        if( len ){
            result = this.data.toString( 'ascii', this.pos, this.pos+len);
            this.pos += len;
        } else {
            for( i=this.pos;i<this.pos+this.data.length;i++ ){
                if( this.data[i] == 0 ){
                    break;
                }
            }
            result = this.data.toString( 'ascii', this.pos, i );
            this.pos = i+1;
        }
        
        return result;
    },
    
    readBytes: function(len) {
        var result;
        if( len ){
            result = this.data.slice( this.pos, this.pos+len );
            this.pos += len;
        } else {
            result = this.data.slice( this.pos );
            this.pos = this.data.length;
        }
        
        return result;
    },
    
    readByte: function() {
        return this.data[ this.pos++ ];
    },
    
    finished: function() {
        return this.pos >= this.data.length;
    }
}

exports.createDataBuffer = function( data ) {
    if( Array.isArray(data) )
        data = new Buffer( data );
    
    var result = new DataBuffer( data );
    
    return result;
}

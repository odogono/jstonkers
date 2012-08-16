

var createCanvas = function(){
    if( document )
        return document.createElement('canvas');
    else
        return new Canvas();
}


var BitmapFontCanvas = module.exports = function(options){
    this.strings = {};
    this._configure( options || {} );
    // the main cache canvas
    this.canvas = createCanvas();
    this.comCanvas = createCanvas();
    this.canvas.width = this.comCanvas.width = this.width;
    this.canvas.height = this.comCanvas.height = this.height;
    // console.log('sized at ' + this.width + ',' + this.height );
    this.ctx = this.canvas.getContext('2d');
    this.comCtx = this.comCanvas.getContext('2d');
    this.bounds = [0,0,0,0];
};

_.extend(BitmapFontCanvas.prototype, {
    _configure: function(options) {
        this.options = options;
        this.chars = options.chars;
        this.image = options.image;
        this.charWidth = options.charWidth || 16;
        this.charHeight = options.charHeight || 16;
        this.kern = _.isUndefined(options.kern) ? -1 : options.kern;
        this.width = options.width || 512;
        this.height = options.height || 256;
    },

    _drawString: function( ctx, str, x, y ){
        var i, index;
        var bounds = [x,y,0,this.charHeight];
        for(i=0;i<str.length;i++ ){
            index = this.chars.indexOf( str.charAt(i) );
            // console.log( 'drawing ' + str.charAt(i) );
            // console.log('drawing fr ' + 0 + ',' + (this.charHeight*index) + ',' + this.charWidth + ',' + this.charHeight );
            // console.log('drawing at ' + x + ',' + y + ',' + this.charWidth + ',' + this.charHeight );
            ctx.drawImage( this.image,
                0,0+(this.charHeight*index),this.charWidth, this.charHeight,  
                x,y,this.charWidth, this.charHeight);
            x += this.charWidth + this.kern;
        }
        bounds[2] = x;
        return bounds;
    },

    _paintString: function( str, col){
        var resultBounds,x=0,y=0;
        
        // draw string
        this.comCtx.globalCompositeOperation = 'source-over';
        resultBounds = this._drawString( this.comCtx, str, x, y );
        // apply colours
        this.comCtx.globalCompositeOperation = 'source-atop';
        if( _.isArray(col) ){
            // 2-tone
            this.comCtx.fillStyle = col[0];
            this.comCtx.fillRect(resultBounds[0], resultBounds[1], resultBounds[2], resultBounds[3]-4 );
            this.comCtx.fillStyle = col[1];
            this.comCtx.fillRect(resultBounds[0], resultBounds[1]+resultBounds[3]-4, resultBounds[2], 4 );
        } else {
            this.comCtx.fillStyle = col;
            this.comCtx.fillRect(resultBounds[0], resultBounds[1], resultBounds[2], resultBounds[3] );
        }
        
        // find position in main canvas
        resultBounds[0] = this.bounds[0];
        resultBounds[1] = this.bounds[3];

        this.ctx.drawImage( this.comCanvas, resultBounds[0], resultBounds[1] );
        this.bounds[2] = Math.max( this.bounds[2], resultBounds[2] );
        this.bounds[3] = this.bounds[3] + resultBounds[3] + 1;
        

        return resultBounds;
    },

    add: function( str, options ){
        options || (options={});
        var self = this, x=0,y=0, resultBounds;
        var key = options.key || str;
        var col = options.col || "#FFF";
        str = str.toUpperCase();

        if( this.strings[key] )
            return this.strings[key];

        // clear our scratchpad canvas
        this.comCtx.clearRect ( 0, 0, this.width , this.height );

        if( _.isString(col) )
            resultBounds = this._paintString( str, col );
        else if( _.isArray(col) ){
            resultBounds = _.map( col, function(c){
                return self._paintString( str, c );
            })
            if( resultBounds.length == 1 )
                resultBounds = resultBounds[0];
        }
        
        return this.strings[key] = {bounds:resultBounds, str:str};
    },

    getBounds: function(str){
        return this.strings[str] ? this.strings[str].bounds : null;
    },

    drawString: function( str, ctx, x, y, options ){
        options || (options={});
        var key = options.key || str;
        var entry = this.strings[key];
        var bounds = entry.bounds;

        // console.log('entry for ' + str + ' ' + JSON.stringify(entry) );
        if( _.isArray(bounds[0]) ){
            bounds = options.index ? bounds[options.index] : bounds[0];
        }

        if( options.justify ){
            // TODO : add left,right,centre
        }

        ctx.drawImage( this.canvas,
            bounds[0], bounds[1], bounds[2], bounds[3],
            x,y, bounds[2], bounds[3] );
    }
});
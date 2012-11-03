var Entity = require('odgn-entity');
var Map = require('./map');
var Canvas = require('canvas'), Image = Canvas.Image;

// converts an rgba into a 32bit int 
var packPixel = function( r, g, b, a ) {
    var result = ((r<<24)>>>0) + (g<<16) + (b<<8) + (a);
    return result;
}

var loadImage = function( path, callback ){
    var img = new Image();
    img.onerror = function(err){ callback(err); };
    img.onload = function(){
        callback(null, img);
    }
    img.src = path;
};

// loads map data from a specified image path
var getMapData = function( path, callback ){
    // log('loading from ' + path );
    var srcImage = new Image();
    srcImage.onerror = function(err){ callback(err); };
    srcImage.onload = function(){
        var canvas = new Canvas( srcImage.width, srcImage.height );
        var context = canvas.getContext('2d');
        context.drawImage(srcImage, 0, 0);
        var imageData = context.getImageData(0, 0, srcImage.width, srcImage.height);

        callback(null, imageData );
    }

    srcImage.src = path;
}




_.extend( Map.Entity.prototype, {
    
    loadData: function( path, callback ){
        var self = this;
        getMapData( path, function(err,imageData){
            if( err ){
                callback(err);
                return;
            }
            // log('loaded map data of ' + imageData.width + ' x ' + imageData.height );

            var indices = [];
            var indexedData = [];
            var data = imageData.data;
            var i,len,rowLength = imageData.width*4, pixel;
            // log( rowLength );

            // read the pixel index from the top line of the image
            for( i=0;i<rowLength;i+=4 ){
                // log( data[i] );
                indices.push( packPixel(data[i], data[i+1], data[i+2], data[i+3]) );
            }

            for( i=rowLength,len=data.length;i<len;i+=4 ){
                pixel = packPixel( data[i], data[i+1], data[i+2], data[i+3] );
                indexedData.push( indices.indexOf(pixel) );
            }

            // self.set('data')
            self.set('width', imageData.width);
            self.set('height', imageData.height-1);
            self.set('_data', indexedData );
            self.set('_data_path', path );

            callback(null,self);
        });
        
    },

    // plots the results of a path find to an image
    plotPath: function( start, target, options, callback ){
        if( _.isFunction(options) ){
            callback = options;
            options = {};
        }

        var startTime = Date.now();
        var i, part, path = this.findPath( start, target, options );
        var outputWidth = options.outputWidth || 256;
        var outputHeight = options.outputHeight || 256;

        var scaleX, scaleY;

        if( options.debug ){
            print_var( path );
        }

        // create a canvas
        var canvas = new Canvas( outputWidth, outputHeight );
        var context = canvas.getContext('2d');
        context.patternQuality = 'fast'; // AKA no-antialiasing
        var outPath = 'plotpath.png';

        loadImage( this.get('_data_path'), function(err,img){
            scaleX = outputWidth / img.width;
            scaleY = outputHeight / img.height;
            // draw the image without the top index row
            context.drawImage(img, 0, 1, img.width, img.height, 0,0, outputWidth, outputHeight );

            // draw the path
            for( i in path ){
                part = path[i];

                if( i === 0 ){
                    context.beginPath();
                    context.moveTo(part[0] * scaleX + (scaleX*0.5), part[1] * scaleY + (scaleY*0.5) ); 
                } else {
                    context.lineTo(part[0] * scaleX + (scaleX*0.5), part[1] * scaleY + (scaleY*0.5) );
                }
            }
            context.stroke();

            for( i in path ){
                part = path[i];
                context.beginPath();
                context.arc( part[0] * scaleX + (scaleX*0.5), part[1] * scaleY + (scaleY*0.5), scaleX * 0.125, 0, 2 * Math.PI, false);
                context.fillStyle = "#FFF";
                context.fill();
                context.stroke();
            }


            // save the image
            canvas.toBuffer(function(err, buffer){
                if( err ){ callback(err); return; }
                Common.fs.writeFileSync( outPath, buffer );
                callback();
            });
            
        });
        
    }

});
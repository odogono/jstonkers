#!/usr/bin/env node

// 
// Used to convert png collision maps into an indexed pixmap for use by the server
// Required to remove the need to use png libraries within the server process
//
// The top row of the image is assumed to be the index row.
// successive rows of image data are converted to indexes and then saved out
//

var Common = require('../src/common')
    , Canvas = require('canvas')
    , Image = Canvas.Image
    , path = require('path')
    , fs = require('fs');


println('running process_map');

program
    .version('1.0.0')
    .option('-s --source <source>', 'source image')
    .parse( process.argv );

if( !program.source ) {
    process.stdout.write(program.helpInformation());
    // program.emit('--help');
    process.exit(1);
}

var srcPath = path.normalize( program.source );
var dstPath = srcPath;
if( _.endsWith(dstPath,'.png') )
    dstPath = dstPath.substring(0, dstPath.length - '.png'.length );
dstPath += '.pix';

println('using source ' + srcPath );
println('output to ' + dstPath );

// converts an rgba into a 32bit int 
var packPixel = function( r, g, b, a ) {
    var result = ((r<<24)>>>0) + (g<<16) + (b<<8) + (a);
    return result;
}

var srcImage = new Image();

srcImage.onerror = function(err){ throw err; };

srcImage.onload = function(){
    var canvas = new Canvas( srcImage.width, srcImage.height );
    var context = canvas.getContext('2d');
    context.drawImage(srcImage, 0, 0);
    var imageData = context.getImageData(0, 0, srcImage.width, srcImage.height);
    var data = imageData.data, i, len, pixel;

    var indices = [];
    var indexedData = [];
    
    log('loaded ' + program.source + ' with dims ' + srcImage.width + ' x ' + srcImage.height );

    var rowLength = srcImage.width*4;

    // read the pixel index from the top line of the image
    for( i=0;i<rowLength;i+=4 ){
        indices.push( packPixel(data[i], data[i+1], data[i+2], data[i+3]) );
    }

    for( i=rowLength,len=data.length;i<len;i+=4 ){
        pixel = packPixel( data[i], data[i+1], data[i+2], data[i+3] );
        indexedData.push( indices.indexOf( pixel ) );
    }

    // write the indexed data out in our format
    var buffer = new Buffer( indexedData.length + 4 + 4 + 4 );

    // write id
    buffer.write( 'CMAP' );
    // map width
    buffer.writeUInt32BE( srcImage.width, 4 );
    // map height
    buffer.writeUInt32BE( srcImage.height-1, 8 );
    // map data
    for( i=0,len=indexedData.length;i<len;i++ )
        buffer.writeUInt8( indexedData[i], 12 + i );

    fs.createWriteStream( dstPath ).write( buffer );

};

// begin the processing
srcImage.src = program.source;

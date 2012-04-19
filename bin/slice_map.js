#!/usr/bin/env node

var Common = require('../src/common'),
    Canvas = require('canvas')
  , Image = Canvas.Image,
  mkdirp = require('mkdirp');

var TILE_SIZE = 256;

println('running slice_map');

program
    .version('0.0.1')
    .option('-s --source <source>', 'source image')
    .option('-d --destdir <destdir>', 'destination directory')
    .option('-z --zoomprefix <zoomprefix', 'zoom prefix', parseInt, 0 )
    .parse( process.argv );


println('using source ' + program.source );
println('using dest ' + program.destdir );
println('using zoom prefix ' + program.zoomprefix );


// ensure the dest dir is created
mkdirp.sync( program.destdir, '0777' );

// clear the dest dir of its contents

var srcImage = new Image();
srcImage.onerror = function(err){ throw err; };
srcImage.onload = function(){
    // log('loaded ' + program.source + ' ' + srcImage.width + 'x' + srcImage.height );
    var tilesX = (srcImage.width / TILE_SIZE);
    var tilesY = (srcImage.height / TILE_SIZE);
    var canvas = new Canvas( TILE_SIZE, TILE_SIZE );
    var context = canvas.getContext('2d');
    var x = 0, y = 0;
    var inc = 0;
    var buffer, filename;
    // var filename;

    for( y=0;y<tilesY;y++ ){
        for( x=0;x<tilesX;x++ ){
            filename = _.sprintf( "%s-%s-%s.png", program.zoomprefix, x, y );
            filename = Common.path.join( program.destdir, filename );

            // draw the cropped image
            context.drawImage( srcImage, -(x*TILE_SIZE), -(y*TILE_SIZE) );
            buffer = canvas.toBuffer();

            Common.fs.writeFileSync( filename, buffer );
        }
    }
};

// begin the processing
srcImage.src = program.source;
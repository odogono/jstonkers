
jstonkers.view.MapView = jstonkers.view.ScrollView.extend({
    
    tileSize: 256,
    tileArray:[],
    tilesInitialised:false,
    
    initialize: function() {
        
        // define the template used for tiles
        $.template( "template-map_tile", $("#template-map_tile") );
        
        // call superclass initialiser - this will in turn end up calling
        // setZoom and initialiseTiles (in that order)
        jstonkers.view.ScrollView.prototype.initialize.call(this, this.options);
        
        this.imageSrc = this.model.get('image_src');
    },
    
    /**
    *
    */
    render: function() {
        jstonkers.view.ScrollView.prototype.render.call(this);
        if( this.invalid ){
            return this;
        }
        var x = 0, y = 0, imageTile = null;
        var colTiles = [];
        var bounds = this.window;
        // var worldBounds = this.level.bounds;
        var levels = this.model.get("levels");
        
        var levelBounds = levels[ this.zoom-1 ].bounds;
        
        this.tileSize = levels[ this.zoom-1 ].tile_size;
        this.cols = Math.ceil( bounds[2] / this.tileSize )+1;
        this.rows = Math.ceil( bounds[3] / this.tileSize )+1;
        this.worldCols = Math.ceil( levelBounds[2] / this.tileSize );
        this.worldRows = Math.ceil( levelBounds[3] / this.tileSize );
        
        $(this.el).empty();
        this.tileArray = [];
        
        for( y = 0;y<this.rows;y++ )
        {
            colTiles = [];
            for( x = 0;x<this.cols;x++ )
            {
                imageTile = this.generateImageTag( x*this.tileSize, y*this.tileSize, x, y, this.zoom );        
                $(imageTile).appendTo(this.el);
                colTiles.push( imageTile );
            }
            this.tileArray.push( colTiles );
        }
        
        this.tilesInitialised = true;
        
        this.setWorldPosition();
        
        return this;
    },


    
    setWorldPosition: function( pPosition ) {
        
        if( arguments.length <= 0 || pPosition === undefined){
            var currentPosition = this.model.get('position');
            pPosition = currentPosition;
            // wx = currentPosition[0]; wy = currentPosition[1];
        }
        
        // call the superclass to set bounds etc
        // console.log("MV.SWP setting to " + wx + "," + wy );
        jstonkers.view.ScrollView.prototype.setWorldPosition.call(this, pPosition);
        
        var imgTile = null;
        var levels = this.model.get("levels");
        var bounds = this.window;
        
        var x = 0, y = 0;
        // find the starting tile positions
        var sx = ((bounds[0] / this.tileSize) | 0);
        var sy = ((bounds[1] / this.tileSize) | 0);  
        var xx = -(bounds[0] % this.tileSize);
        var yy = -(bounds[1] % this.tileSize);
        // console.log("MV window.bounds: " + JSON.stringify(bounds) );
        // console.log("x " + xx + ", y " + yy );
        // console.log("bounds.x " + bounds.x + " " + tilesize );
        // console.log( "sx: " + (bounds.x / tilesize) + " - " + ((bounds.x / tilesize) | 0) );
        
        for( y = 0;y<this.rows;y++ ) {
            for( x = 0;x<this.cols;x++ ) {
                imgTile = this.tileArray[y][x];
                this.updateImageTile( imgTile, 
                    xx + (this.tileSize*x), yy + (this.tileSize*y), 
                    sx + x, sy + y, this.zoom );
                // console.log( imgTile );
                // console.log( (xx + (tileSize*x)) + "," + (yy + (tileSize*y)) );
            }
        }
        
    },

    generateImageTag: function( px, py, gx, gy, zoom )
    {
        var img = $.tmpl( "template-map_tile", { top: py, left: px } )[0];
        img.col = gx; img.row = gy;
        img.src = '/img/tiles/' + zoom + '/' + gx + '-' + gy + '.png';
        img.xpos = px; img.ypos = py;
        return img;
    },
    
    updateImageTile : function( imgTile, px, py, gx, gy, zoom ) {
        var buffer = [];
        
        imgTile.style.left = px + "px";
        imgTile.style.top = py + "px";
        imgTile.xpos = px; 
        imgTile.ypos = py;
        
        if( imgTile.col != gx || imgTile.row != gy ) {        
            imgTile.col = gx;  imgTile.row = gy;
            buffer[buffer.length] = "/img/tiles/";

            if( gx >= 0 && gy >= 0 && gx <= this.worldCols && gy <= this.worldRows ) {
                buffer[buffer.length] = zoom;
                buffer[buffer.length] = "/";
                buffer[buffer.length] = gx;
                buffer[buffer.length] = "-";
                buffer[buffer.length] = gy;
                buffer[buffer.length] = ".png";
            }
            else {
                buffer[buffer.length] = "n-n.png";
            }
            imgTile.src = buffer.join("");
        }
    },
    
    
});
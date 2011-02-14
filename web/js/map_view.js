
jstonkers.view.MapView = jstonkers.view.ScrollView.extend({
    
    tileSize: 256,
    tileArray:[],
    
    initialize: function() {
        
        // call superclass initialiser - this will in turn end up calling
        // setZoom and initialiseTiles (in that order)
        jstonkers.view.ScrollView.prototype.initialize.call(this, this.options);
        
        // this.imageSrc = this.model.get('image_src');
        this.template = this.options.template;
    },
    
    /**
    *
    */
    render: function() {
        jstonkers.view.ScrollView.prototype.render.call(this);
        if( this.invalid ){
            return this;
        }
        var x = 0, y = 0, sx = 0, sy = 0, imageTile = null;
        var colTiles = [];
        var bounds = this.window;
        var position = this.model.get('position');
        var levels = this.model.get('levels');
        
        var levelBounds = levels[ this.zoom-1 ].bounds;
        
        this.imageSrc = this.model.get('image_src');
        this.tileSize = levels[ this.zoom-1 ].tile_size;
        this.cols = Math.ceil( bounds[2] / this.tileSize )+1;
        this.rows = Math.ceil( bounds[3] / this.tileSize )+1;
        this.worldCols = Math.ceil( levelBounds[2] / this.tileSize );
        this.worldRows = Math.ceil( levelBounds[3] / this.tileSize );
        
        // call superclass to determine correct positions and dimensions
        jstonkers.view.ScrollView.prototype.setWorldPosition.call(this);
        
        sx = ((this.window[0] / this.tileSize) | 0);
        sy = ((this.window[1] / this.tileSize) | 0);  
        xx = -(this.window[0] % this.tileSize);
        yy = -(this.window[1] % this.tileSize);
        
        // empty the contents of our container before beginning the repopulation
        $(this.el).empty();
        this.tileArray = [];
        
        for( y = 0;y<this.rows;y++ )
        {
            colTiles = [];
            for( x = 0;x<this.cols;x++ )
            {
                imageTile = this.generateImageTag( xx + (x*this.tileSize), yy + (y*this.tileSize), sx + x, sy + y, this.zoom );        
                $(imageTile).appendTo(this.el);
                colTiles.push( imageTile );
                // console.log('img: ' + (xx + (x*this.tileSize)) + ',' + (yy + (y*this.tileSize)) + ',' + (sx + x) + ',' + (sy + y) );
                // console.log( imageTile );
            }
            this.tileArray.push( colTiles );
        }
        
        return this;
    },


    setWorldPosition: function( pPosition ) {
        
        if( !pPosition ){
            pPosition = this.model.get('position');
        }
        
        // call the superclass to set bounds etc
        jstonkers.view.ScrollView.prototype.setWorldPosition.call(this, pPosition);
        
        var imgTile = null;
        var levels = this.model.get("levels");
        
        var x = 0, y = 0;
        // find the starting tile positions
        var sx = ((this.window[0] / this.tileSize) | 0);
        var sy = ((this.window[1] / this.tileSize) | 0);  
        var xx = -(this.window[0] % this.tileSize);
        var yy = -(this.window[1] % this.tileSize);
        
        for( y = 0;y<this.rows;y++ ) {
            for( x = 0;x<this.cols;x++ ) {
                imgTile = this.tileArray[y][x];
                this.updateImageTile( imgTile, 
                    xx + (this.tileSize*x), yy + (this.tileSize*y), 
                    sx + x, sy + y, this.zoom );
            }
        }
    },

    generateImageTag: function( px, py, gx, gy, zoom )
    {
        var imgSrc = this.imageSrc + 'n-n.png';
        if( gx >= 0 && gy >= 0 && gx < this.worldCols && gy < this.worldRows ) {
            imgSrc = this.imageSrc + zoom + '/' + gx + '-' + gy + '.png';
        }
        // var img = $.tmpl( this.template, { top: py, left: px } )[0];
        var img = $('<img class="tile" src="' + imgSrc + '" style="top:' + py + 'px; left:' + px + 'px;" />')[0];
        // img.src = imgSrc;
        img.col = gx; img.row = gy;
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
            buffer[buffer.length] = this.imageSrc;

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
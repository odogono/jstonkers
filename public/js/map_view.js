
stonkers.model.MapTileModel = Backbone.Model.extend({

});

stonkers.ui.MapTileView = Backbone.View.extend({
    
    //... is a image tag.
    tagName:  "img",
    
    // Cache the template function for a single item.
    template: $.template( "template-map_tile", $("#template-map_tile") ),
    
    initialize: function() {
        
    },
    
    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
     
});


stonkers.ui.MapView = stonkers.ui.ScrollView.extend({ // Backbone.View.extend({
    
    tileSize: 256,
    tileArray:[],
    tilesInitialised:false,
    
    initialize: function() {
        
        // define the template used for tiles
        $.template( "template-map_tile", $("#template-map_tile") );
        
        // call superclass initialiser - this will in turn end up calling
        // setZoom and initialiseTiles (in that order)
        stonkers.ui.ScrollView.prototype.initialize.call(this, this.options);
    },
    
    initialiseTiles: function() {
        var x = 0, y = 0, imagetile = null;
        var colTiles = [];
        
        // console.log("position: " + JSON.stringify(this.window.bounds) );
        // console.log("rows: " + this.rows + " cols: " + this.cols );
        
        for( y = 0;y<this.rows;y++ )
        {
            colTiles = [];
            for( x = 0;x<this.cols;x++ )
            {
                imagetile = this.generateImageTag( x*this.level.tilesize, y*this.level.tilesize, x, y, this.zoom );        
                $(imagetile).insertAfter(this.el);
                colTiles.push( imagetile );
            }
            this.tileArray.push( colTiles );
        }
        
        this.tilesInitialised = true;
    },
    
    setZoom: function( z ) {
        stonkers.ui.ScrollView.prototype.setZoom.call(this, z);
        // console.log("map zoom called " + JSON.stringify(this.level) );
        
        var bounds = this.window.bounds;
        var worldBounds = this.level.bounds;
        this.cols = Math.ceil( bounds.width / this.level.tilesize )+1;
        this.rows = Math.ceil( bounds.height / this.level.tilesize )+1;
        this.worldCols = Math.ceil( worldBounds.width / this.level.tilesize );
        this.worldRows = Math.ceil( worldBounds.height / this.level.tilesize );
        
        this.setWorldPosition();
    },
    

    
    setWorldPosition: function( wx, wy ) {
        if( arguments.length <= 0 ){
            var currentPosition = this.model.get('position');
            wx = currentPosition.x; wy = currentPosition.y;
        }
        // call the superclass to set bounds etc
        stonkers.ui.ScrollView.prototype.setWorldPosition.call(this, wx,wy);
        
        if( !this.tilesInitialised )
            this.initialiseTiles();
        
        var imgtile = null;
        var tilesize = this.level.tilesize;
        var bounds = this.window.bounds;
        var x = 0, y = 0;
        // find the starting tile positions
        var sx = ((bounds.x / tilesize) | 0);
        var sy = ((bounds.y / tilesize) | 0);  
        var xx = -(bounds.x % tilesize);
        var yy = -(bounds.y % tilesize);
        // console.log("window.bounds: " + JSON.stringify(this.window.bounds) );
        // console.log("bounds.x " + bounds.x + " " + tilesize );
        // console.log( "sx: " + (bounds.x / tilesize) + " - " + ((bounds.x / tilesize) | 0) );
        
        for( y = 0;y<this.rows;y++ )
        {
            for( x = 0;x<this.cols;x++ )
            {
                imgtile = this.tileArray[y][x];
                this.updateImageTile( imgtile, 
                    xx + (tilesize*x), yy + (tilesize*y), 
                    sx + x, sy + y, this.zoom );
                // if( y == 0 )
                //     console.log("tile: " + (xx + (tilesize*x)) + "," + (yy + (tilesize*y)) );
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
    
    updateImageTile : function( imgtile, px, py, gx, gy, zoom ) {
        var buffer = [];
        
        imgtile.style.left = px + "px";
        imgtile.style.top = py + "px";
        imgtile.xpos = px; 
        imgtile.ypos = py;
        
        if( imgtile.col != gx || imgtile.row != gy ) {        
            imgtile.col = gx;  imgtile.row = gy;
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
            imgtile.src = buffer.join("");
        }
    },
    
    
});
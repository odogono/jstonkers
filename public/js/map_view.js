var MapTileModel = Backbone.Model.extend({

});

var MapTileView = Backbone.View.extend({
    
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


var MapView = ScrollView.extend({ // Backbone.View.extend({
    
    TILE_SIZE: 256,
    
    tileArray:[],

    initialize: function() {
        // call superclass initialiser
        ScrollView.prototype.initialize.call(this, this.options);
        
        // this.bind('move', this.onScrollMove );
        var self = this;
        var window_bounds = this.window.get("bounds");
        var world_bounds = this.world.get("bounds");
        
        // console.log(this.window.cid);
        // 
        
        this.zoom = 1;
        this.cols = Math.ceil( window_bounds.width / this.TILE_SIZE )+1;
        this.rows = Math.ceil( window_bounds.height / this.TILE_SIZE )+1;
        this.worldCols = Math.ceil( world_bounds.width / this.TILE_SIZE );
        this.worldRows = Math.ceil( world_bounds.height / this.TILE_SIZE );
        
        $.template( "template-map_tile", $("#template-map_tile") );
        
        var colTiles = [];
        
        for( var y = 0;y<this.rows;y++ )
        {
            colTiles = [];
            for( var x = 0;x<this.cols;x++ )
            {
                var imagetile = this.generateImageTag( x*this.TILE_SIZE, y*this.TILE_SIZE, x, y, this.layerIndex, this.zoom );        
                $(imagetile).insertAfter(this.el);//.insertBefore( this.el );
                colTiles.push( imagetile );
            }
            this.tileArray.push( colTiles );
        }
        
        // listen to change of bounds from model
        this.window.bind('change:bounds', function(model,bounds){
            self.placeTiles( bounds );
        });
    },
    
    generateImageTag: function( left, top, gx, gy, layerIndex, zoom )
    {
        var img = $.tmpl( "template-map_tile", { top: top, left: left } )[0];
        img.col = gx; img.row = gy;
        img.src = '/img/tiles/' + gx + '-' + gy + '.png';
        img.ypos = top; img.xpos = left;
        return img;
    },
    
    placeTiles: function( window_bounds ) {
        var imgtile = null;
        
        // find the starting tile positions
        var sx = ((window_bounds.x / this.TILE_SIZE)|0);
        var sy = ((window_bounds.y / this.TILE_SIZE)|0);  
        var xx = -(window_bounds.x % this.TILE_SIZE);
        var yy = -(window_bounds.y % this.TILE_SIZE);
        
        // console.log("start: " + window_bounds.x + "," + window_bounds.y + " " + xx + "," + yy );
          
        for( var y = 0;y<this.rows;y++ )
        {
            for( var x = 0;x<this.cols;x++ )
            {
                imgtile = this.tileArray[y][x];

                this.updateImageTile( imgtile, 
                    xx + (this.TILE_SIZE*x), 
                    yy + (this.TILE_SIZE*y), 
                    sx + x, sy + y, this.zoom );
            }
        }
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
                // buffer[buffer.length] = zoom;
                // buffer[buffer.length] = "/";
                buffer[buffer.length] = gx;
                buffer[buffer.length] = "-";
                buffer[buffer.length] = gy;
                buffer[buffer.length] = ".png";
            }
            else {
                // console.log( gx + "," + gy + " " + this.worldCols + " " + this.worldRows );
                // console.log( this );
                buffer[buffer.length] = "n-n.png";
            }
            imgtile.src = buffer.join("");
        }
    },
    
    
});
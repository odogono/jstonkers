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
        
        this.window.bind('change:bounds', function(model,bounds){
            self.moveTiles( bounds );
            // console.log("model player changed bounds ");
        //     console.log( bounds );
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
    
    // addTile: function() {
    //     var view = new MapTileView();
    //     $(this.surface).before( imagetile );
    //     
    //     var view = new TodoView({model: todo});
    //     this.$("#todo-list").append(view.render().el);
    // },
    
    // onScrollMove: function(window, window_bounds ) { //px,py,pw,ph,mx,my) {
    //     // var window_bounds = this.window.get("bounds");
    //     // console.log("onScrollMove");
    //     // console.log( arguments );
    //     // console.log( window_bounds );
    //     
    // },
    
    moveTiles: function( window_bounds ) {
        var imgtile = null;
        var xx = 0;
        var yy = 0;
        var changed = false;
        
        for( var y = 0;y<this.rows;y++ )
        {
            for( var x = 0;x<this.cols;x++ )
            {
                // console.log("move tile " + window_bounds.cx + "," + window_bounds.cy );
                imgtile = this.tileArray[y][x];
                xx = imgtile.xpos - (window_bounds.cx);
                yy = imgtile.ypos - (window_bounds.cy);
                changed = false;
                
                if( xx > window_bounds.width )
                {
                    xx -= (this.cols*256);
                    this.updateImageTile( imgtile, imgtile.col-this.cols, imgtile.row, this.zoom );
                }
                if( (xx+256) < 0 )
                {
                    xx += (this.cols*256);
                    this.updateImageTile( imgtile, imgtile.col+this.cols, imgtile.row, this.zoom );
                }
                if( yy > window_bounds.height )
                {
                    yy -= (this.rows*256);
                    this.updateImageTile( imgtile, imgtile.col, imgtile.row-this.rows, this.zoom );
                }
                if( (yy+256) < 0 )
                {
                    yy += (this.rows*256);
                    this.updateImageTile( imgtile, imgtile.col, imgtile.row+this.rows, this.zoom );
                }
                
                imgtile.style.left = xx + "px";
                imgtile.style.top = yy + "px";
                imgtile.xpos = xx; imgtile.ypos = yy;
            }
        }
    },
    
    updateImageTile : function( imgtile, gx, gy, zoom ) {
        var buffer = [];

        imgtile.col = gx;  imgtile.row = gy;
        buffer[buffer.length] = "/img/tiles/";

        if( gx >= 0 && gy >= 0 && gx <= this.worldCols && gy <= this.worldRows )
        {
            // buffer[buffer.length] = zoom;
            // buffer[buffer.length] = "/";
            buffer[buffer.length] = gx;
            buffer[buffer.length] = "-";
            buffer[buffer.length] = gy;
            buffer[buffer.length] = ".png";
        }
        else
        {
            // console.log( gx + "," + gy + " " + this.worldCols + " " + this.worldRows );
            // console.log( this );
            buffer[buffer.length] = "n-n.png";
        }
        imgtile.src = buffer.join("");
    },
    
    
});
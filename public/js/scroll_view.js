var ScrollView = Backbone.View.extend({
    
    control:this,
    moved:false,
    // world:{ x:-1000, y:-1000, width:1000, height:1000 },
    dragStart:{ x:0, y:0 },
    
    events: {
        "mousedown": "onMouseDown",
    },
    
    initialize: function() {
        
        console.log("scroll view initialised");
        // console.log( this.options );
        // console.log(this.el);
        
        this.world = this.options.world;
        this.window = this.options.window;
        
        var self = this;
        // $(this.el).css('background-color', 'FF0000');
        this.position = $(this.el).position();
        // this.window.set({ position:{ x:this.position.left, y:this.position.right, width:$(this.el).width(), height:$(this.el).height() } });
        this.window.set({ bounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height(), cx:0, cy:0 } });
        
        // because the mouse may come up outside the view window, we
        // need to listen to up events on the document.
        $(document).mouseup(function() {
            // dragging has finished, remove the move handler
            delete self.events.mousemove;
            self.delegateEvents();
            // console.log("mouse up");
        });
        
        // _.extend(this, Backbone.Events);
    },
    
    onMouseDown: function( evt ) {
        // console.log("mouse down");
        this.window.set( {message:"hi there" });
        // console.log( this.window.cid );
        // record the initial position of the drag
        this.moved = false;
        this.dragStart = { x:evt.pageX, y:evt.pageY };
        this.dragPosition = { x:evt.pageX, y:evt.pageY };
        
        // since the mouse is down, move move is now a drag - 
        // add the new handler to the events
        this.events.mousemove = "onMouseDrag";
        this.delegateEvents();
        return false;
    },
    
    onMouseDrag: function(evt) {
        var win = _.clone(this.window.get("bounds"));
        var world_bounds = this.world.get("bounds");
        var start = this.dragStart;
        
        win.cx = start.x-evt.pageX;
        win.cy = start.y-evt.pageY;
        // var movement = { x:start.x-evt.pageX, y:start.y-evt.pageY };
        // console.log( "movement: " + movement.x + "," + movement.y );
        // console.log( "bounds:" + (world_bounds.width) );
        if( win.x + win.cx < world_bounds.x || win.x + win.cx > (world_bounds.width-win.width) )
            win.cx = world_bounds.x;
        if( win.y + win.cy < world_bounds.y  || win.y + win.cy > (world_bounds.height-win.height) ){
            // console.log( (win.x+movement.x) + "," + (win.y+movement.y) + " " + (world_bounds.height-win.height));
            win.cy = world_bounds.y;
        }
        
        win.x += win.cx;
        win.y += win.cy;
        
        // win.cx = movement.x;
        // win.cy = movement.y;
        // console.log( "win: " + win.x + "," + win.y );
        this.window.set({ bounds:win });
        // console.log( this.window.cid );
        // notify any interested parties about the move event
        // this.trigger('move', win.x, win.y, win.width, win.height, movement.x, movement.y);
        
        this.dragStart = { x:evt.pageX, y:evt.pageY };
        this.moved = true;
        return false;
    },
});
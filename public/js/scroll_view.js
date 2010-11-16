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
        
        // because the mouse may come up outside the view window, we
        // need to listen to up events on the document.
        $(document).mouseup(function() {
            // dragging has finished, remove the move handler
            delete self.events.mousemove;
            self.delegateEvents();
        });
    },
    
    onMouseDown: function( evt ) {
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
        
        if( win.x + win.cx < world_bounds.x || win.x + win.cx > (world_bounds.width-win.width) )
            win.cx = world_bounds.x;
        if( win.y + win.cy < world_bounds.y  || win.y + win.cy > (world_bounds.height-win.height) ){
            win.cy = world_bounds.y;
        }
        
        win.x += win.cx;
        win.y += win.cy;
        
        // update the model with the new window location on the world
        // notice that we had to clone the existing window bounds, since
        // the update function will not work (its a reference)
        this.window.set({ bounds:win });
        
        this.dragStart = { x:evt.pageX, y:evt.pageY };
        this.moved = true;
        return false;
    },
});
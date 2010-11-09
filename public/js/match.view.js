$(function(){
	
	window.World = Backbone.Model.extend({
	    
	    bounds:{x:0,y:0,width:1000,height:1000},
	    
    });
	
	window.ScrollView = Backbone.View.extend({
	    
	    control:this,
        moved:false,
        world:{ x:-1000, y:-1000, width:1000, height:1000 },
        dragStart:{ x:0, y:0 },
        
        events: {
            "mousedown": "onMouseDown",
        },
        
	    initialize: function() {
	        var self = this;
	        $(this.el).css('background-color', 'FF0000');
	        this.position = $(this.el).position();
	        this.screen = { x:this.position.left, y:this.position.right, width:$(this.el).width(), height:$(this.el).height() };
	        this.window = { x:0, y:0, width:$(this.el).width(), height:$(this.el).height() };
	        
            // because the mouse may come up outside the view window, we
            // need to listen to up events on the document.
            $(document).mouseup(function() {
                // dragging has finished, remove the move handler
                delete self.events.mousemove;
                self.delegateEvents();
            });
            
            _.extend(this, Backbone.Events)
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
            var win = this.window;
            var world = this.world;
            var start = this.dragStart;
            
            var movement = { x:start.x-evt.pageX, y:start.y-evt.pageY };
            
            if( win.x + movement.x < world.x || win.x + movement.x > (world.width-win.width) )
                movement.x = world.x;
            if( win.y + movement.y < world.y  || win.y + movement.y > (world.height-win.height) )
                movement.y = world.y;
            
            win.x += movement.x;
            win.y += movement.y;
            
            // notify any interested parties about the move event
            this.trigger('move', win.x, win.y, movement.x, movement.y);
            
            this.dragStart = { x:evt.pageX, y:evt.pageY };
            this.moved = true;
            return false;
        },
        
    });
	
	window.AppView = Backbone.View.extend({
	    
	    // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#stonkers"),
        
        // Delegated events for creating new items, and clearing completed ones.
        events: {
            
        },
        
        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {
          // _.bindAll(this, 'addOne', 'addAll', 'render');
          console.log("app initialised");
          
          this.scrollView = new ScrollView( {el: this.el} );
          this.scrollView.bind('move', this.onScrollMove );
        },
        
        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        // render: function() {
        //     
        // },
        
        onScrollMove: function(x,y) {
            console.log("move " + x + "," + y );
        },
        
    });
    
    // Finally, we kick things off by creating the **App**.
    window.App = new AppView;
});
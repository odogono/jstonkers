
jstonkers.view.ScrollView = Backbone.View.extend({
    
    control:this,
    moved:false,
    limitBounds:true,
    ignoreWorldPositionUpdate: false,
    dragStart:{ x:0, y:0 },
    zoom:1,
    touchDown: false,
    
    events: {
        "mousedown": "onMouseDown",
        "mousemove": "onMouseMove",
        
        // "touchstart": "onMouseDown",
        // "touchend": "onMouseUp",
        // "touchmove": "onMouseDrag",
    },
    
    initialize: function() {
        
        var self = this;
        // console.log("scroll view initialised");
        // console.log( this.options );
        // console.log(this.el);
        
        this.world = this.options.world;
        // this.window = this.options.window;
        // this.zoom = this.options.zoom || this.zoom;
        this.levels = this.options.levels;
        
        this.elOffset = $(this.el).offset();
        
        // initialise with placeholder values
        this.window = {
            bounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height() },
            worldBounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height() },
            worldPosition:{ x:0, y:0 },
            mul:{x:0,y:0},
        };
        
        // call to initialise the this.window parameters
        
        this.setZoom( this.model.get('zoom') );
        
        this.model.bind('change:position', function(model,position){
            if( !self.ignoreWorldPositionUpdate )
                self.setWorldPosition( position.x, position.y );
        });
        
        this.model.bind('change:zoom', function(model,zoom){
            self.setZoom( zoom ); 
        });
        
        // because the mouse may come up outside the view window, we
        // need to listen to up events on the document.
        $(document).mouseup(function(e) {
            self.onMouseUp(e);
        });
    },
    

    
    setZoom: function( z ) {
        if( (z-1) >= 0 || (z-1) < this.levels.length )
            this.zoom = z;
        var level = this.level = this.levels[this.zoom-1];
        var worldBounds = this.world.get("bounds");
        // update the multiplier based on the bounds
        this.window.mul = {x: worldBounds.width / level.bounds.width, y:worldBounds.height / level.bounds.height};
        // console.log( "zoom: " + this.zoom + " muls: " + JSON.stringify(this.window.mul) );
        this.trigger('zoom', this.zoom);
    },
    
    setWorldPosition: function( wx, wy ) {
        var worldBounds = this.world.get("bounds");
        var worldBoundsChanged = false;
        var wwbWidth, wwbHeight;
        
        // compute the new window world bounds
        wwbWidth = this.window.worldBounds.width = this.window.bounds.width * this.window.mul.x;
        wwbHeight = this.window.worldBounds.height = this.window.bounds.height * this.window.mul.y;
        
        this.window.worldBounds.x = wx - (wwbWidth/2);
        this.window.worldBounds.y = wy - (wwbHeight/2);
        
        // console.log("A world.bounds: " + JSON.stringify(this.window.worldBounds) );
        if( this.limitBounds ) {
            // console.log("WB: " + JSON.stringify(this.window.worldBounds) );
            if( wwbWidth >= worldBounds.width ){
                this.window.worldBounds.x = ((worldBounds.x+worldBounds.width)/2) - (wwbWidth/2); worldBoundsChanged = true;
            }
            // else if( this.window.worldBounds.x < worldBounds.x && this.window.worldBounds.x + wwbWidth > worldBounds.x+worldBounds.width ){
                // this.window.worldBounds.x = ((worldBounds.x+worldBounds.width)/2) - (wwbWidth/2);
            // }
            else {
                if( this.window.worldBounds.x < worldBounds.x ){
                    this.window.worldBounds.x = worldBounds.x; worldBoundsChanged = true; }
                else if( this.window.worldBounds.x + wwbWidth > worldBounds.x+worldBounds.width ){
                    this.window.worldBounds.x = worldBounds.x+worldBounds.width - wwbWidth; worldBoundsChanged = true;}
            }
            //if( this.window.worldBounds.y < worldBounds.y && this.window.worldBounds.y + wwbHeight > worldBounds.y+worldBounds.height ){
            if( wwbHeight >= worldBounds.height ) {
                this.window.worldBounds.y = ((worldBounds.y+worldBounds.height)/2) - (wwbHeight/2);worldBoundsChanged = true;
            }
            else{
                if( this.window.worldBounds.y < worldBounds.y ){
                    this.window.worldBounds.y = worldBounds.y; worldBoundsChanged = true; }
                else if( this.window.worldBounds.y + wwbHeight > worldBounds.y+worldBounds.height ){
                    this.window.worldBounds.y = worldBounds.y+worldBounds.height - wwbHeight; worldBoundsChanged = true; }
            }
            
        }
        
        // reupdate the centre position
        this.window.worldPosition.x = this.window.worldBounds.x + (wwbWidth/2);
        this.window.worldPosition.y = this.window.worldBounds.y + (wwbHeight/2);
        
        // set the real position of the window based on the model position
        this.window.bounds.x = this.window.worldBounds.x / this.window.mul.x;//  (wx / this.window.mul.x) - (bounds.width/2)
        this.window.bounds.y = this.window.worldBounds.y / this.window.mul.y;//(wy / this.window.mul.y) - (bounds.height/2)
        
        // console.log("B world.bounds: " + JSON.stringify(this.window.worldBounds) );
        
        // if we ended up altering the world position based on bounds, then reupdate
        // the model - notice we have to set a flag to prevent recursion
        if( worldBoundsChanged ){
            this.ignoreWorldPositionUpdate = true;
            this.model.set({position: _.clone(this.window.worldPosition) });
            this.ignoreWorldPositionUpdate = false;
        }
        
        this.trigger('move');
    },
    
    onMouseUp: function(e){
        this.touchDown = false;
        // dragging has finished, remove the move handler
        // delete this.events.mousemove;
        // this.delegateEvents();
    },
    
    onMouseDown: function( evt ) {
        // record the initial position of the drag
        this.moved = false;
        this.touchDown = true;
        this.dragStart = { x:evt.pageX, y:evt.pageY };
        this.dragPosition = { x:evt.pageX, y:evt.pageY };
        
        // TODO : fix IOS handling
        // if(evt.touches && evt.touches.length == 1) {
        //     var touch = evt.touches[0];
        //     this.dragStart = { x:touch.pageX, y:touch.pageY };
        //     this.dragPosition = { x:touch.pageX, y:touch.pageY };
        // }
        
        // since the mouse is down, move move is now a drag - 
        // add the new handler to the events
        // this.events.mousemove = "onMouseDrag";
        // this.delegateEvents();
        return false;
    },
    
    
    onMouseMove: function(evt) {
        var x = evt.pageX - this.elOffset.left;
        var y = evt.pageY - this.elOffset.top;

        // convert screen position to world position
        
        $('#debug_cursor').html( x + ", " + y );

        if( this.touchDown ){
            this.onMouseDrag(evt);
        }
        return false;
    },
    
    
    
    onMouseDrag: function(evt) {
        var position = _.clone(this.model.get("position"));
        var start = this.dragStart;
        var mx = 0, my = 0;
        
        // TODO : fix IOS handling
        if(evt.touches && evt.touches.length == 1){ // Only deal with one finger
            var touch = evt.touches[0]; // Get the information for finger #1
            mx = start.x-touch.pageX;
            my = start.y-touch.pageY;
        }
        else{
            mx = start.x-evt.pageX;
            my = start.y-evt.pageY;
        }
        
        // update the world position on the model
        position.x += mx * this.window.mul.x;
        position.y += my * this.window.mul.y;
        
        this.setWorldPosition( position.x, position.y );
        
        // update the model with the new window location on the world
        // notice that we had to clone the existing window bounds, since
        // the update function will not work (its a reference)
        // Also, we have to flag that the setWorldPosition should not be set
        // again
        this.ignoreWorldPositionUpdate = true;
        this.model.set({position: _.clone(this.window.worldPosition) });
        this.ignoreWorldPositionUpdate = false;
        
        this.dragStart = { x:evt.pageX, y:evt.pageY };
        this.moved = true;
        evt.preventDefault();
        return false;
    },
});
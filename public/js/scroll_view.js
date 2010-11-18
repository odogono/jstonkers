
stonkers.ui.ScrollView = Backbone.View.extend({
    
    control:this,
    
    moved:false,
    
    limitBounds:true,
    
    ignoreWorldPositionUpdate: false,
    
    // world:{ x:-1000, y:-1000, width:1000, height:1000 },
    dragStart:{ x:0, y:0 },
    
    zoom:1,
    
    events: {
        "mousedown": "onMouseDown",
    },
    
    initialize: function() {
        
        console.log("scroll view initialised");
        // console.log( this.options );
        // console.log(this.el);
        
        this.world = this.options.world;
        // this.window = this.options.window;
        this.zoom = this.options.zoom || this.zoom;
        this.levels = this.options.levels;
        
        // initialise with placeholder values
        this.window = {
            bounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height() },
            worldBounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height() },
            worldPosition:{ x:0, y:0 },
            mul:{x:0,y:0},
        };
        
        // call to initialise the this.window parameters
        this.setZoom( this.zoom );
        this.setWorldPosition( 0,0 );
        
        var self = this;
        
        this.model.bind('change:position', function(model,position){
            if( !self.ignoreWorldPositionUpdate )
                self.setWorldPosition( position.x, position.y );
        });
        
        // because the mouse may come up outside the view window, we
        // need to listen to up events on the document.
        $(document).mouseup(function() {
            // dragging has finished, remove the move handler
            delete self.events.mousemove;
            self.delegateEvents();
        });
    },
    
    setZoom: function( z ) {
        if( (z-1) >= 0 || (z-1) < this.levels.length )
            this.zoom = z;
        var level = this.level = this.levels[this.zoom-1];
        var worldBounds = this.world.get("bounds");
        // update the multiplier based on the bounds
        this.window.mul = {x: worldBounds.width / level.bounds.width, y:worldBounds.height / level.bounds.height};
        console.log( "zoom: " + this.zoom + " muls: " + JSON.stringify(this.window.mul) );
    },
    
    setWorldPosition: function( wx, wy ) {
        var worldBounds = this.world.get("bounds");
        var worldBoundsChanged = false;
        
        // compute the new window world bounds
        this.window.worldBounds.width = this.window.bounds.width * this.window.mul.x;
        this.window.worldBounds.height = this.window.bounds.height * this.window.mul.y;
        this.window.worldBounds.x = wx - (this.window.worldBounds.width/2);
        this.window.worldBounds.y = wy - (this.window.worldBounds.height/2);
        
        if( this.limitBounds ) {
            if( this.window.worldBounds.x < worldBounds.x ){
                this.window.worldBounds.x = worldBounds.x; worldBoundsChanged = true }
            if( this.window.worldBounds.x + this.window.worldBounds.width > worldBounds.x+worldBounds.width ){
                this.window.worldBounds.x = worldBounds.x+worldBounds.width - this.window.worldBounds.width; worldBoundsChanged = true }
            if( this.window.worldBounds.y < worldBounds.y ){
                this.window.worldBounds.y = worldBounds.y; worldBoundsChanged = true }
            if( this.window.worldBounds.y + this.window.worldBounds.height > worldBounds.y+worldBounds.height ){
                this.window.worldBounds.y = worldBounds.y+worldBounds.height - this.window.worldBounds.height; worldBoundsChanged = true }
        }
        
        // reupdate the centre position
        this.window.worldPosition.x = this.window.worldBounds.x + (this.window.worldBounds.width/2);
        this.window.worldPosition.y = this.window.worldBounds.y + (this.window.worldBounds.height/2);
        
        // set the real position of the window based on the model position
        this.window.bounds.x = this.window.worldBounds.x / this.window.mul.x;//  (wx / this.window.mul.x) - (bounds.width/2)
        this.window.bounds.y = this.window.worldBounds.y / this.window.mul.y;//(wy / this.window.mul.y) - (bounds.height/2)
        
        // if we ended up altering the world position based on bounds, then reupdate
        // the model - notice we have to set a flag to prevent recursion
        if( worldBoundsChanged ){
            this.ignoreWorldPositionUpdate = true;
            this.model.set({position: _.clone(this.window.worldPosition) });
            this.ignoreWorldPositionUpdate = false;
        }
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
        var position = _.clone(this.model.get("position"));
        var start = this.dragStart;
        
        var mx = start.x-evt.pageX;
        var my = start.y-evt.pageY;
        
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
        return false;
    },
});
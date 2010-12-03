
jstonkers.view.ScrollView = Backbone.View.extend({
    
    control:this,
    moved:false,
    limitBounds:true,
    ignoreWorldPositionUpdate: false,
    dragStart:[0,0],
    zoom:1,
    touchDown: false,
    mul:[1,1],
    cursor:[0,0],
    worldCursor:[0,0],
    window:[0,0,0,0],
    invalid: true,
    
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
        
        // this.world = this.options.world;
        // this.levels = this.options.levels;
        
        this.elOffset = $(this.el).offset();
        
        this.window = [0,0,$(this.el).width(),$(this.el).height()];
        
        this.model.bind('change:zoom', function(model,zoom){
            self.render();
        });
        
        this.model.bind('change:levels', function(model,bounds){
           self.render();
        });
        
        // because the mouse may come up outside the view window, we
        // need to listen to up events on the document.
        $(document).mouseup(function(e) {
            self.touchDown = false;
            self.trigger('mouseup', e);
            // self.onMouseUp(e);
            // console.log("scrollView MU");
        });
    },
    
    
    render: function() {
        var levels = this.model.get("levels");
        
        var worldBounds = this.model.get("bounds");
        this.zoom = this.model.get('zoom');
        
        if( !levels || !levels[this.zoom-1] ){
            this.invalid = true;
            return this;
        }
        
        var levelBounds = levels[ this.zoom-1 ].bounds;
        
        this.mul = [ worldBounds[2] / levelBounds[2], worldBounds[3]/levelBounds[3] ];
        
        this.invalid = false;
        return this;
    },

    setWorldPosition: function( pPosition ) {
        var worldBounds = this.model.get("bounds");
        var wWindow = _.clone(this.model.get("window"));
        // var mul = this.model.get("mul");
        var worldBoundsChanged = false;
        var wwbWidth, wwbHeight;
        var worldPos = [0,0];
        
        // compute the new window world bounds
        wwbWidth = wWindow[2] = this.window[2] * this.mul[0];
        wwbHeight = wWindow[3] = this.window[3] * this.mul[1];
        
        wWindow[0] = pPosition[0] - (wwbWidth/2);
        wWindow[1] = pPosition[1] - (wwbHeight/2);
        
        
        // console.log("A world.bounds: " + JSON.stringify(wWindow) );
        
        if( this.limitBounds ) {
            // console.log("WB: " + JSON.stringify(wWindow) );
            if( wwbWidth >= worldBounds[2] ){
                wWindow[0] = ((worldBounds[0]+worldBounds[2])/2) - (wwbWidth/2); worldBoundsChanged = true;
            }
            // else if( wWindow.x < worldBounds.x && wWindow.x + wwbWidth > worldBounds.x+worldBounds.width ){
                // wWindow.x = ((worldBounds.x+worldBounds.width)/2) - (wwbWidth/2);
            // }
            else {
                if( wWindow[0] < worldBounds[0] ){
                    wWindow[0] = worldBounds[0]; worldBoundsChanged = true; }
                else if( wWindow[0] + wwbWidth > worldBounds[0]+worldBounds[2] ){
                    wWindow[0] = worldBounds[0]+worldBounds[2] - wwbWidth; worldBoundsChanged = true;}
            }
            //if( wWindow.y < worldBounds.y && wWindow.y + wwbHeight > worldBounds.y+worldBounds.height ){
            if( wwbHeight >= worldBounds[3] ) {
                wWindow[1] = ((worldBounds[1]+worldBounds[3])/2) - (wwbHeight/2); worldBoundsChanged = true;
            }
            else{
                if( wWindow[1] < worldBounds[1] ){
                    wWindow[1] = worldBounds[1]; worldBoundsChanged = true; }
                else if( wWindow[1] + wwbHeight > worldBounds[1]+worldBounds[3] ){
                    wWindow[1] = worldBounds[1]+worldBounds[3] - wwbHeight; worldBoundsChanged = true; }
            }
        }//*/
        
        // console.log("A world.bounds: " + JSON.stringify(wWindow) );
        
        // reupdate the centre position
        // worldPos[0] = wWindow[0] + (wwbWidth/2);
        // worldPos[1] = wWindow[1] + (wwbHeight/2);
        
        // set the real position of the window based on the model position
        this.window[0] = wWindow[0] / this.mul[0];
        this.window[1] = wWindow[1] / this.mul[1];
        
        // console.log("A window: " + JSON.stringify(this.window) );
        
        this.model.set({window:wWindow, silent:true});
        
        // if we ended up altering the world position based on bounds, then reupdate
        // the model - notice we have to set a flag to prevent recursion
        // if( worldBoundsChanged ){
            this.ignoreWorldPositionUpdate = true;
            this.model.set({position:[wWindow[0] + (wwbWidth/2), wWindow[1] + (wwbHeight/2)]  });
            // console.log("WBC - setting model position to " + JSON.stringify(this.model.get('position')) );
            this.ignoreWorldPositionUpdate = false;
        // }
        
        // console.log("A position: " + JSON.stringify(this.model.get('position')) );
        // console.log("window position: " + JSON.stringify( this.window ) );
        
        this.trigger('move');
    },
    
    // onMouseUp: function(e){
    //     
    //     // dragging has finished, remove the move handler
    //     // delete this.events.mousemove;
    //     // this.delegateEvents();
    // },
    
    onMouseDown: function( evt ) {
        // record the initial position of the drag
        this.moved = false;
        this.touchDown = true;
        this.dragStart = [ evt.pageX, evt.pageY ];
        // this.dragPosition = [ evt.pageX, evt.pageY ];
        
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
        
        var x = this.cursor[0] = evt.pageX - this.elOffset.left;
        var y = this.cursor[1] = evt.pageY - this.elOffset.top;
        var wBounds = this.model.get("bounds");

        // convert screen position to world position
        x = this.worldCursor[0] = wBounds[0] + (x * this.mul[0]);
        y = this.worldCursor[1] = wBounds[1] + (y * this.mul[1]);
        // x = this.window.mul.x;
        
        $('#debug_cursor').html( x + ", " + y);// + " " + JSON.stringify(this.window.worldBounds));

        if( this.touchDown ){
            this.onMouseDrag(evt);
        }
        
        this.trigger('cursor');
        return true;
    },
    
    
    convertPosition: function( position ){
        var x = position[0] - this.elOffset.left;
        var y = position[1] - this.elOffset.top;
        var wBounds = this.model.get("bounds");
        
        position[0] = wBounds[0] + (x * this.mul[0]);
        position[1] = wBounds[1] + (y * this.mul[1]);
        
        return position;
    },
    
    
    
    onMouseDrag: function(evt) {
        var position = _.clone(this.model.get("position"));
        var mx = 0, my = 0;
        
        // TODO : fix IOS handling
        if(evt.touches && evt.touches.length == 1){ // Only deal with one finger
            var touch = evt.touches[0]; // Get the information for finger #1
            mx = this.dragStart[0]-touch.pageX;
            my = this.dragStart[1]-touch.pageY;
        }
        else {
            mx = this.dragStart[0]-evt.pageX;
            my = this.dragStart[1]-evt.pageY;
        }
        
        // update the world position on the model
        position[0] += mx * this.mul[0];
        position[1] += my * this.mul[1];
        
        this.setWorldPosition( position );
        
        // update the model with the new window location on the world
        // notice that we had to clone the existing window bounds, since
        // the update function will not work (its a reference)
        // Also, we have to flag that the setWorldPosition should not be set
        // again
        // this.ignoreWorldPositionUpdate = true;
        // this.model.set({position: position });
        // console.log("setting model position to " + JSON.stringify(this.model.get('position')));
        // this.ignoreWorldPositionUpdate = false;
        
        this.dragStart = [evt.pageX, evt.pageY];
        this.moved = true;
        evt.preventDefault();
        return false;
    },
});
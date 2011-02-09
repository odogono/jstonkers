
jstonkers.view.ScrollView = Backbone.View.extend({
    
    moved:false,
    limitBounds:true,
    dragStart:[0,0],
    zoom:1,
    touchDown: false,
    mul:[1,1],
    cursor:[0,0],
    cursorWorld:[0,0],
    window:[0,0,0,0],
    invalid: true,
    
    events: {
        "mousedown": "onMouseDown",
        "mousemove": "onMouseMove",
    },
    
    initialize: function() {
        var self = this;
        this.elOffset = $(this.el).offset();
        this.elOffset = [this.elOffset.left, this.elOffset.top];
        
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
        });
    },
    
    
    render: function() {
        var levels = this.model.get('levels');
        
        var worldBounds = this.model.get('bounds');
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
        var worldBounds = this.model.get('bounds');
        var wWindow = _.clone(this.model.get('window'));
        var worldBoundsChanged = false;
        var wwbWidth, wwbHeight;
        var worldPos = [0,0];
        
        pPosition = pPosition || this.model.get('position');
        
        // compute the new window world bounds
        wwbWidth = wWindow[2] = this.window[2] * this.mul[0];
        wwbHeight = wWindow[3] = this.window[3] * this.mul[1];
        
        wWindow[0] = pPosition[0] - (wwbWidth/2);
        wWindow[1] = pPosition[1] - (wwbHeight/2);
        
        if( this.limitBounds ) {
            if( wwbWidth >= worldBounds[2] ){
                wWindow[0] = ((worldBounds[0]+worldBounds[2])/2) - (wwbWidth/2); worldBoundsChanged = true;
            }
            else {
                if( wWindow[0] < worldBounds[0] ){
                    wWindow[0] = worldBounds[0]; worldBoundsChanged = true; }
                else if( wWindow[0] + wwbWidth > worldBounds[0]+worldBounds[2] ){
                    wWindow[0] = worldBounds[0]+worldBounds[2] - wwbWidth; worldBoundsChanged = true;}
            }
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
        
        // set the real position of the window based on the model position
        this.window[0] = wWindow[0] / this.mul[0];
        this.window[1] = wWindow[1] / this.mul[1];
        
        this.model.set({window:wWindow, silent:true});
        
        // reupdate the centre position
        this.model.set({position:[wWindow[0] + (wwbWidth/2), wWindow[1] + (wwbHeight/2)]  });
        
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
        
        return false;
    },
    
    
    onMouseMove: function(evt) {
        cursorWorld = [ evt.pageX, evt.pageY ];
        this.convertPosition( cursorWorld );
        this.trigger('cursor', cursorWorld[0], cursorWorld[1], evt.pageX, evt.pageY );
        
        if( this.touchDown ){
            this.onMouseDrag(evt);
        }
        return true;
    },
    
    
    convertPosition: function( position ){
        var x = position[0] - this.elOffset[0];
        var y = position[1] - this.elOffset[1];
        var wBounds = this.model.get("window");
        
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
        
        this.dragStart = [evt.pageX, evt.pageY];
        this.moved = true;
        evt.preventDefault();
        return false;
    },
});
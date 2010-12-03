jstonkers.view.Division = Backbone.View.extend({
    
    className: 'sprite division',
    
    events:{
        "mousedown": "onTouchDown",
        // "mousemove": "onTouchMove",
    },
    
    
    initialize: function() {
        var self = this;
        var type = this.model.get('type');
        this.model.view = this;
        this.view = this.options.view;
        this.zoom = this.view.zoom;
        this.uvs = this.view.spriteData[ this.view.zoom-1 ][type];// [0,0,0,0];
        
        _.bindAll(this, "render", "updatePosition");
        
        // listen to changes in the models position and update our own
        this.model.bind('change:position', this.updatePosition);
        
        // this.view.bind('cursor', this.onTouchMove);
        $(document).bind('mousemove', function(e){
            if( self.touchDown ){
                self.onTouchMove(e);
            }
            return true;
        });
        
        $(document).mouseup(function(e) {
            if( self.touchDown ){
                self.touchDown = false;
                $(self.el).removeClass('selected');
            }
        });
    },
    
    render: function() {
        if( this.view.invalid ){
            return this;
        }
        var type = this.model.get('type');
        // var modelZoom = this.view.model.get('zoom');

        $(this.el).addClass( type );
        
        // its necessary to remove the previous zoom class since this 
        // function modifies not creates
        $(this.el).removeClass('zoom_' + this.zoom).addClass( 'zoom_' + this.view.zoom );
        this.zoom = this.view.zoom;
        
        // set the UVs of the sprite
        // if( data ){
            this.uvs = this.view.spriteData[ this.zoom-1 ][type];
            this.el.style.backgroundPosition = -this.uvs[0] + 'px ' + -this.uvs[1] + 'px';
            this.el.style.width = this.uvs[2];
            this.el.style.height = this.uvs[3];
        // }
        
        this.updatePosition();
        
        return this;
    },
    
    updateModel: function(model){
    },
    
    updatePosition: function(model,model_position) {
        var position = model_position || this.model.get('position');
        var mul = this.view.mul;
        var bounds = this.view.window;
        var x = position[0];
        var y = position[1];
        
        // console.log("updating position to " + x + "," + y + " - bounds - " + JSON.stringify(bounds) );
        x = (x/mul[0]) - bounds[0];
        y = (y/mul[1]) - bounds[1];
        
        // console.log("updating position to " + x + "," + y + " - " + mul[0] + "," + mul[1] );
        
        // console.log("updating " + JSON.stringify(this.uvs) );
        x -= (this.uvs[2]/2);
        y -= (this.uvs[3]/2);
        // y -= (this.el.style.height/2);
        
        // console.log( "wid: " + this.el.style.width );
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        // console.log( JSON.stringify(position) );
        // console.log(this.el);
    },

    
    onTouchDown: function(evt){
        this.touchDown = true;
        $(this.el).addClass('selected');
        return false;
    },
    
    onTouchMove: function(evt){
        if( this.touchDown ) {
            this.model.set({position:this.view.convertPosition( [evt.pageX, evt.pageY] ) });
        }
        return false;
    },
    
    onTouchUp: function(){
      
    },
});



jstonkers.view.SpriteView = jstonkers.view.MapView.extend({
    
    initialize: function() {
        // _.extend( this.events, jstonkers.view.MapView.prototype.events );
        
        // console.log( "events: " + JSON.stringify(this.events) );
        $.template( "template-map_division", $("#template-map_division") );
        
        _.bindAll(this, "addOne", "addAll");
        
        this.sprites = this.options.sprites;
        
        this.sprites.bind('add', this.addOne);
        this.sprites.bind('refresh', this.addAll);
        
        this.spriteData = jstonkers.sprite_data;
        
        jstonkers.view.MapView.prototype.initialize.call(this, this.options);
        // this.divisions.bind('all',     this.render);
        
        // this.delegateEvents();
    },
    
    
    render: function() {
        var self = this;
        jstonkers.view.MapView.prototype.render.call(this);
        
        this.sprites.each( function(sprite){
            self.addOne( sprite );
        });
    },
    
    
    addOne: function(model_division){
        var position = model_division.get('position');
        
        var divisionView = new jstonkers.view.Division({
            id: model_division.get('id'), 
            model: model_division, 
            map: this,
            view: this,
        });
        
        $(this.el).append(divisionView.render().el);
        
        // make sure the sprite is updated when the map is moved (screen pos)
        this.bind('move', divisionView.updatePosition);
        
        // make sure the sprite is updated when the zoom changes (css changes)
        // this.bind('zoom', divisionView.render);
    },
    
    addAll: function(){
        this.sprites.each(this.addOne);
    },

});
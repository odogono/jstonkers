jstonkers.view.Division = Backbone.View.extend({
    
    className: 'sprite division',
    
    events:{
        "click": "select",
    },
    
    initialize: function() {
        _.bindAll(this, "render", "updatePosition");
        
        this.model.view = this;
        this.view = this.options.view;
        this.zoom = this.view.zoom;
        
        // listen to changes in the models position and update our own
        this.model.bind('change:position', this.updatePosition);
        
        // update initial position
        this.updatePosition();
    },
    
    render: function() {
        
        var data = this.view.spriteData[ this.view.zoom-1 ];
        var dims;
        var type = this.model.get('type');

        $(this.el).addClass( type );
        
        // its necessary to remove the previous zoom class since this 
        // function modifies not creates
        $(this.el).removeClass('zoom_' + this.zoom).addClass( 'zoom_' + this.view.zoom );
        this.zoom = this.view.zoom;
        
        // set the UVs of the sprite
        if( data ){
            dims = data[type];
            this.el.style.backgroundPosition = -dims[0] + 'px ' + -dims[1] + 'px';
            this.el.style.width = dims[2];
            this.el.style.height = dims[3];
        }
        return this;
    },
    
    updateModel: function(model){
    },
    
    updatePosition: function(model,model_position) {
        var position = model_position || this.model.get('position');
        var mul = this.view.window.mul;
        var bounds = this.view.window.bounds;
        var x = (position.x/mul.x) - bounds.x;
        var y = (position.y/mul.y) - bounds.y;
        
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        // console.log( JSON.stringify(position) );
        // console.log("updating position to " + x + "," + y );
    },

    
    select: function(){
        console.log( "selected " + this.model.get("id") );
    }
    
});



jstonkers.view.SpriteView = jstonkers.view.MapView.extend({
    
    initialize: function() {
        $.template( "template-map_division", $("#template-map_division") );
        
        _.bindAll(this, "addOne", "addAll");
        
        this.sprites = this.options.sprites;
        
        this.sprites.bind('add', this.addOne);
        this.sprites.bind('refresh', this.addAll);
        
        this.spriteData = jstonkers.sprite_data;
        
        jstonkers.view.MapView.prototype.initialize.call(this, this.options);
        // this.divisions.bind('all',     this.render);
    },
    
    // setWorldPosition: function( wx, wy ) {
    //     var position;
    //     jstonkers.view.MapView.prototype.setWorldPosition.call(this, wx,wy);
    // },
    // 
    // setZoom: function( z ) {
    //     jstonkers.view.MapView.prototype.setZoom.call(this, z);
    //     // console.log("added new sprite of zoom " + this.zoom);
    // },
    
    addOne: function(model_division){
        var position = model_division.get('position');
        
        var divisionView = new jstonkers.view.Division({
            id: model_division.get('id'), 
            model: model_division, 
            map: this,
            view: this,
        });
        
        $(".world_view").append(divisionView.render().el);
        
        // make sure the sprite is updated when the map is moved (screen pos)
        this.bind('move', divisionView.updatePosition);
        
        // make sure the sprite is updated when the zoom changes (css changes)
        this.bind('zoom', divisionView.render);
    },
    
    addAll: function(){
        this.sprites.each(this.addOne);
    },
});
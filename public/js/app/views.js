jstonkers.view.Division = Backbone.View.extend({
    
    // template: $.template( "template-map_division", $("#template-map_division") ),
    // template: _.template("<div class='sprite division <%= type %>' style='top:<%= screen.top %> left:<%= screen.left %>' />"),
    className: 'sprite division',
    
    initialize: function() {
        _.bindAll(this, "render", "updatePosition");
        this.model.bind('change:screen', this.updatePosition);
        this.model.view = this;
        this.map = this.options.map;
        this.zoom = this.map.zoom;
        this.updatePosition( this.model, this.model.get('screen') );
        // console.log( this.map.spriteData );
        // console.log( window.jstonkers.sprite_data[0]['tank'] );
        // this.model.bind('change', this.render);
    },
    
    render: function() {
        
        var data = this.map.spriteData[ this.map.zoom-1 ];
        var dims;
        var type = this.model.get('type');

        $(this.el).addClass( type );
        
        // its necessary to remove the previous zoom class since this 
        // function modifies not creates
        $(this.el).removeClass('zoom_' + this.zoom).addClass( 'zoom_' + this.map.zoom );
        this.zoom = this.map.zoom;
        
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
    
    updatePosition: function(model,position){
        el = this.el;
        el.style.left = position.left + "px";
        el.style.top = position.top + "px";
    },
    
});



jstonkers.view.SpriteView = jstonkers.view.MapView.extend({
    initialize: function() {
        $.template( "template-map_division", $("#template-map_division") );
        
        _.bindAll(this, "addOne", "addAll");
        jstonkers.view.MapView.prototype.initialize.call(this, this.options);
        this.sprites = this.options.sprites;
        this.sprites.bind('add',     this.addOne);
        this.spriteData = jstonkers.sprite_data;
        
        // this.sprites.bind('refresh', this.addAll);
        // this.divisions.bind('all',     this.render);
    },
    setWorldPosition: function( wx, wy ) {
        var position;
        jstonkers.view.MapView.prototype.setWorldPosition.call(this, wx,wy);
        var mul = this.window.mul;
        var bounds = this.window.bounds;
        // console.log( JSON.stringify(this.window) );
        if( this.sprites )
            this.sprites.each( function(sprite){
                position = sprite.get('position');
                sprite.set( { 
                    screen:{
                        left:((position.x/mul.x) - bounds.x), 
                        top:((position.y/mul.y) - bounds.y)} } );
            });
    },
    setZoom: function( z ) {
        jstonkers.view.MapView.prototype.setZoom.call(this, z);
        // console.log("added new sprite of zoom " + this.zoom);
    },
    
    addOne: function(division){
        var divisionView = new jstonkers.view.Division({id:'division_' + division.get('id'), model: division, map:this});
        $(".world_view").append(divisionView.render().el);
        // divisionView.updatePosition
        // console.log(this);
        this.bind('zoom', divisionView.render);
        // this.bind('zoom', function(){
        //     $(divisionView.el).replaceWith( divisionView.render() );
        // })
    },
    
    // addAll: function(){
    //     this.divisions.each(this.addOne);
    // },
});
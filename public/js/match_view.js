$(function(){
    
    jstonkers.model.Sprite = Backbone.Model.extend({
        set : function(attrs, options) {
            if( attrs.position ) {
                this.set( {screen:{left: attrs.position.x, top: attrs.position.y} });
                // this.set({left: attrs.position.x, top: attrs.position.y});
                // console.log("setting position on sprite");
            }
            Backbone.Model.prototype.set.call(this, attrs, options);
        },
    });
    
    
    jstonkers.model.Division = jstonkers.model.Sprite.extend({
        // set : function(attrs, options) {
        //     Backbone.Model.prototype.set.call(this, attrs, options);
        // },
    });
    
    jstonkers.view.Division = Backbone.View.extend({
        
        template: $.template( "template-map_division", $("#template-map_division") ),
        
        initialize: function() {
            // this.model.bind('change', this.updateModel );
            this.model.bind('change:screen', this.updatePosition);
            this.model.view = this;
        },
        
        render: function() {
            this.el = $.tmpl( "template-map_division", this.model.toJSON() );
            return this;
        },
        
        updateModel: function(model){
        },
        
        updatePosition: function(model,position){
            self = model.view;
            el = model.view.el[0];
            el.style.left = position.left + "px";
            el.style.top = position.top + "px";
        },
        
    });
    
    jstonkers.model.DivisionList = Backbone.Collection.extend({
        model: jstonkers.model.Division,
        
    });
});

$(function(){
	
	jstonkers.model.Player = Backbone.Model.extend({
	    
        initialize: function() {
            this.set( {bounds:{ x:0, y:0, width:0, height:0, cx:0, cy:0 } } );
        },
        
        set : function(attrs, options) {
            // if( attrs.bounds )
                // console.log("calling set bounds on player!");
            // else
                // console.log("calling set on player with " + JSON.stringify(attrs) );
            Backbone.Model.prototype.set.call(this, attrs, options);
        },
        
    });
    
	jstonkers.model.Match = Backbone.Model.extend({
    });
    
    
    jstonkers.view.SpriteView = jstonkers.view.MapView.extend({
        initialize: function() {
            jstonkers.view.MapView.prototype.initialize.call(this, this.options);
            this.sprites = this.options.sprites;
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
        },
    });
        
	
	jstonkers.view.App = Backbone.View.extend({
	    
        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "click #debug_zoom": "onToggleZoom",
        },
        
        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {
            // console.log("app initialised");
            var self = this;
            
            this.divisions = new jstonkers.model.DivisionList();
            this.divisions.bind('add',     this.addOne);
            this.divisions.bind('refresh', this.addAll);
            this.divisions.bind('all',     this.render);
            
            
            this.world = new jstonkers.model.Match();
            this.world.set({bounds:{x:0,y:0,width:2560,height:1536}});
            
            this.player = new jstonkers.model.Player();
            this.player.set({ position:{ x:0, y:0 }});
            
            this.player.bind('change:position', function(model,position){
                $("#debug_position").html(position.x + "," + position.y);
            });
            
            // pass the scroll view models for the world and for the view
            this.mapView = new jstonkers.view.SpriteView( {
                el:$(".world_view .surface"),
                world:this.world,
                // window:this.player,
                model:this.player,
                zoom:1,
                levels: [
                    { bounds:{x:0,y:0,width:1280,height:768}, tilesize:256  },
                    { bounds:{x:0,y:0,width:2560,height:1536}, tilesize:256 },
                ],
                sprites: this.divisions,
            });
            
            // this.player.set({ position:{ x:1200, y:768 }});
            
            // var division = new jstonkers.model.Division();
            // division.set({ top:10, left:10});
            
            this.divisions.add({ position:{x:1000,y:1000}});
            // this.player.set({ position:{ x:0, y:0 }});
        },
        
        addOne: function(division){
            var divisionView = new jstonkers.view.Division({model: division});
            $(".world_view").append(divisionView.render().el);
        },
        
        addAll: function(){
            this.divisions.each(this.addOne);
        },
        
        render: function(){
            
        },
        
        onScrollMove: function(x,y) {
            $("#debug_position").html(x + "," + y);
        },
        
        onToggleZoom: function(e){
            if( this.mapView.zoom == 1 ){
                this.mapView.setZoom(2);
            }else{
                this.mapView.setZoom(1);
            }
            return false;
        },
    });
    
    jstonkers.controllers.Match = Backbone.Controller.extend({

        initialize : function() {
            this.el = $('.jstonkers_view')[0];
            
            jstonkers.view.App = new jstonkers.view.App({ el:this.el});
        },
        
        
    });
    
    // Finally, we kick things off by creating the **App**.
    window.Match = new jstonkers.controllers.Match();
});
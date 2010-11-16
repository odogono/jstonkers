$(function(){
	
	var Player = Backbone.Model.extend({
	    
        // initialize: function() {
        //     // this.set( {view_bounds:{x:0,y:0,width:256,height:256}} ),
        // },
        
    });
    
	var Match = Backbone.Model.extend({
        // initialize: function() {
        //     this.set( {world_bounds:{x:0,y:0,width:2304,height:1280}} ),
        //         },
    });
	
	window.AppView = Backbone.View.extend({
	    
	    // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        // el: $(".world_view"),
        
        // Delegated events for creating new items, and clearing completed ones.
        events: {
            
        },
        
        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function() {
            console.log("app initialised");
            var self = this;
            
            this.world = new Match();
            this.world.set({bounds:{x:0,y:0,width:2560,height:1536}});
            
            this.player = new Player();
            
            // set initial window dimensions based on the size of the element
            var position = $(this.el).position();
            this.player.set({ bounds:{ x:0, y:0, width:$(this.el).width(), height:$(this.el).height(), cx:0, cy:0 } });
            
            this.player.bind('change:bounds', function(model,bounds){
                $("#debug_position").html(bounds.x + "," + bounds.y);
            });
            // 
            // this.player.bind('change', function(model,bounds){
            // });
            // 
            // this.world.bind('change:bounds', function(model,bounds){
            //     console.log("model world changed bounds ");
            //     console.log(bounds );
            // });
            
            // pass the scroll view models for the world and for the view
            this.mapView = new MapView( {el:this.el, world:this.world, window:this.player} );
        },
        
        
        onScrollMove: function(x,y) {
            $("#debug_position").html(x + "," + y);
        },
    });
    
    // Finally, we kick things off by creating the **App**.
    window.App = new AppView({ el:$(".world_view .surface")});
});
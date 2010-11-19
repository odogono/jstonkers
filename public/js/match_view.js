

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
        // initialize: function() {
        //     this.set( {world_bounds:{x:0,y:0,width:2304,height:1280}} ),
        //         },
    });
	
	jstonkers.ui.App = Backbone.View.extend({
	    
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
            
            this.world = new jstonkers.model.Match();
            this.world.set({bounds:{x:0,y:0,width:2560,height:1536}});
            
            this.player = new jstonkers.model.Player();
            this.player.set({ position:{ x:0, y:0 }});
            
            this.player.bind('change:position', function(model,position){
                $("#debug_position").html(position.x + "," + position.y);
            });
            
            // pass the scroll view models for the world and for the view
            this.mapView = new jstonkers.ui.MapView( {
                el:$(".world_view .surface"),
                world:this.world,
                // window:this.player,
                model:this.player,
                zoom:1,
                levels: [
                    { bounds:{x:0,y:0,width:1280,height:768}, tilesize:256  },
                    { bounds:{x:0,y:0,width:2560,height:1536}, tilesize:256 },
                ],
            });
            
            this.player.set({ position:{ x:1200, y:768 }});
            // this.player.set({ position:{ x:0, y:0 }});
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
            
            jstonkers.ui.App = new jstonkers.ui.App({ el:this.el});
        },
        
        
    });
    
    // Finally, we kick things off by creating the **App**.
    window.Match = new jstonkers.controllers.Match();
});
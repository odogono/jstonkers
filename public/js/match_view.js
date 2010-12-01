$(function(){
	
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
                        
            this.world = new jstonkers.model.Match();
            this.world.set({bounds:{x:0,y:0,width:2560,height:1536}});
            
            this.player = new jstonkers.model.Player();
            this.player.set({ position:{ x:0, y:0 }, zoom:1 });
            
            this.player.bind('change:position', function(model,position){
                $("#debug_position").html(position.x + "," + position.y);
            });
            
            // pass the scroll view models for the world and for the view
            this.mapView = new jstonkers.view.SpriteView( {
                el:$(".world_view .surface"),
                world:this.world,
                // window:this.player,
                model:this.player,
                levels: [
                    { bounds:{x:0,y:0,width:1280,height:768}, tilesize:256  },
                    { bounds:{x:0,y:0,width:2560,height:1536}, tilesize:256 },
                ],
                sprites: this.divisions,
            });
            
            // this.player.set({ position:{ x:1200, y:768 }});
            
            // var division = new jstonkers.model.Division();
            // division.set({ top:10, left:10});
            
            this.divisions.add({
                id:'tnk001',
                type:'artillery',
                position:{x:1000,y:1000},
            });

        },
        
        // addOne: function(division){
        //     var divisionView = new jstonkers.view.Division({model: division});
        //     $(".world_view").append(divisionView.render().el);
        // },
        // 
        // addAll: function(){
        //     this.divisions.each(this.addOne);
        // },
        
        // render: function(){
        //     
        // },
        
        onScrollMove: function(x,y) {
            $("#debug_position").html(x + "," + y);
        },
        
        onToggleZoom: function(e){
            if( this.mapView.zoom == 1 ){
                this.player.set({zoom:2});
            }else{
                this.player.set({zoom:1});
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


$(function(){
    // console.log( $('.sprite.zooma') );    
});

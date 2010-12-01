$(function(){
    
    jstonkers.controllers.Match = Backbone.Controller.extend({
        
        initialize : function() {
            this.el = $('.jstonkers_view')[0];
            this.createDefaultModels();
            this.createSubViews();
        },
        
        createDefaultModels : function() {
            
            // a collection of all the divisions in the match
            this.divisions = new jstonkers.model.DivisionList();
            
            this.world = new jstonkers.model.Match();
            this.world.set({bounds:{x:0,y:0,width:2560,height:1536}});
            
            this.player = new jstonkers.model.Player();
            this.player.set({ position:{ x:1174, y:842 }, zoom:1 });
            
            this.player.bind('change:position', function(model,position){
                $("#debug_position").html(position.x + "," + position.y);
            });
        },
        
        createSubViews : function() {
            
            this.mapView = new jstonkers.view.SpriteView( {
                el:$(".world_view .surface")[0],
                world:this.world,
                // window:this.player,
                model:this.player,
                levels: [
                    { bounds:{x:0,y:0,width:1280,height:768}, tilesize:256  },
                    { bounds:{x:0,y:0,width:2560,height:1536}, tilesize:256 },
                ],
                sprites: this.divisions,
            });
        },
        
        refresh: function( data ) {
            console.log("refreshing data");
            
            this.divisions.refresh( data.divisions );
        },
        
        // onScrollMove: function(x,y) {
        //     $("#debug_position").html(x + "," + y);
        // },
        
        toggleZoom: function(e){
            if( this.mapView.zoom == 1 ){
                this.player.set({zoom:2});
            }else{
                this.player.set({zoom:1});
            }
            return false;
        },
    });
    
    // Finally, we kick things off by creating the **App**.
    window.Match = new jstonkers.controllers.Match();
});


$(function(){
    $('#debug_zoom').click( function(){
        return window.Match.toggleZoom();
    });
    window.Match.refresh( jstonkers.data );
    // console.log( $('.sprite.zooma') );    
});

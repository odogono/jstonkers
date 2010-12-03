$(function(){
    
    jstonkers.controllers.Match = Backbone.Controller.extend({
        
        initialize : function() {
            this.el = $('.jstonkers_view')[0];
            this.createDefaultModels();
            this.createSubViews();
            this.renderSubViews();
        },
        
        createDefaultModels : function() {
            
            // a collection of all the divisions in the match
            this.divisions = new jstonkers.model.DivisionList();
            this.world = new jstonkers.model.Match();
            
            this.world.bind('change:position', function(model,position){
                $("#debug_position").html(position[0] + "," + position[1]);
            });
        },
        
        createSubViews : function() {
            
            this.mapView = new jstonkers.view.SpriteView( {
                el:$(".world_view")[0],
                model:this.world,
                sprites: this.divisions,
            });
        },
        
        
        renderSubViews: function(){
            this.mapView.render();
        },

        
        toggleZoom: function(e){
            this.world.set( {zoom:this.world.get('zoom') == 1 ? 2 : 1} );
            return false;
        },
    });
    
    // Finally, we kick things off by creating the **App**.
    window.Match = new jstonkers.controllers.Match();
});


$(function(){
    $('#debug_zoom').click( function(){
        return Match.toggleZoom();
    });
    
    Match.world.set( jstonkers.data.world );
    Match.divisions.refresh( jstonkers.data.divisions );
});

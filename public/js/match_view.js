$(function(){
    
    jstonkers.controllers.Match = Backbone.Controller.extend({
        
        initialize : function() {
            this.el = $('.jstonkers_view')[0];
            this.createDefaultModels();
            this.createSubViews();
            this.renderSubViews();
        },
        
        createDefaultModels : function() {
            this.match = new jstonkers.model.Match();
            this.match.bind('change:position', function(model,position){
                $("#debug_position").html(position[0] + "," + position[1]);
            });
        },
        
        createSubViews : function() {
            // define the template used for tiles
            $.template( "template-map_tile", $("#template-map_tile") );
            
            this.mapView = new jstonkers.view.MatchView( {
                el:$(".world_view")[0],
                model:this.match,
                template:"template-map_tile",
            });
        },
        
        
        renderSubViews: function(){
            this.mapView.render();
        },

        toggleZoom: function(e){
            this.match.set( {zoom:this.match.get('zoom') == 1 ? 2 : 1} );
            return false;
        },
        
        refresh: function( data ) {
            this.match.set( data );
        },
    });
    
    // Finally, we kick things off by creating the **App**.
    window.App = new jstonkers.controllers.Match();
});


$(function(){
    $('#debug_zoom').click( function(){
        return App.toggleZoom();
    });
    
    // Match.world.set( jstonkers.data.world );
    // Match.units.refresh( jstonkers.data.units );
    App.refresh( jstonkers.data );
});

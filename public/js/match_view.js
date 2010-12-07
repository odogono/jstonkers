$(function(){
    
    jstonkers.controllers.Match = Backbone.Controller.extend({
        
        initialize : function() {
            this.el = $('.jstonkers_view')[0];
            this.createDefaultModels();
            this.createSubViews();
            this.renderSubViews();
        },
        
        createDefaultModels : function() {
            
            // a collection of all the units in the match
            this.players = new jstonkers.model.PlayerList();
            this.teams = new jstonkers.model.TeamList();
            this.units = new jstonkers.model.UnitList();
            this.match = new jstonkers.model.Match({
                players:this.players, teams:this.teams, units:this.units
            });
            
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
                // collection: this.units,
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
            if( data.units ) this.units.refresh( data.units );
            if( data.teams ) this.teams.refresh( data.teams );
            if( data.players ) this.players.refresh( data.players );
            if( data.world ) this.match.set( data.world );
            // data.units
            // data.teams
            // data.players
            // data.world
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

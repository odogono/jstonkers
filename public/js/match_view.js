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
                $("#debug_position").html('position: ' + position[0] + "," + position[1]);
            });
        },
        
        createSubViews : function() {
            var self = this;
            // define the template used for tiles
            $.template( "template-map_tile", $("#template-map_tile") );
            
            this.mapView = new jstonkers.view.MatchView( {
                el:$(".world_view")[0],
                model:this.match,
                template:"template-map_tile",
                collision_map:$('#collision_map')[0],
            });
            
        },
        
        
        renderSubViews: function(){
            this.mapView.render();
            
            // nb - no point in rendering until the related image is loaded
            // this.collisionView.render();
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
    
    $('#debug_save').click( function(){
        App.match.save();
        return false;
    })
    
    if( jstonkers.data.socket_enabled ) {
        var socket = new io.Socket(null, {port: 3000, rememberTransport: true});

        socket.connect();
        socket.on('connect', function(){
            console.log('connected');
            socket.send('hi!'); 
        }) 
        socket.on('message', function(data){ 
            console.log('data: ' + JSON.stringify(data));
          // alert(data);
        })
        socket.on('disconnect', function(){
           console.log('disconnected'); 
        });
    }
    
    // Match.world.set( jstonkers.data.world );
    // Match.units.refresh( jstonkers.data.units );
    App.refresh( jstonkers.data );
});



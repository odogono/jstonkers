$(function(){
    
    jstonkers.controllers.MatchController = Backbone.Controller.extend({
        
        initialize : function() {
            var self = this;
            this.el = $('.jstonkers_view')[0];
            this.createDefaultModels();
            this.createSubViews();
            this.renderSubViews();
            
            // TODO AV : find better place for this
            // re-render the subviews after a window resize. the
            // resize is delayed for a while to stop instant results which
            // may cause flicker and pain
            $(window).resize((function() {
              var timeout = null;
              return function() {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(function(){
                    self.renderSubViews();
                }, 250);
              };
            })());
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
            
            // we cant set the inventory views model until the
            // data arrives later
            this.inventoryViews = [
                new jstonkers.view.InventoryView({
                    el:$('#inventory_0')[0],
                    model:this.match,
                    teamIndex:0,
                }),
                new jstonkers.view.InventoryView({
                    el:$('#inventory_1')[0],
                    model:this.match,
                    teamIndex:1,
                }),
            ];
        },
        
        renderSubViews: function(){
            this.mapView.render();
            this.inventoryViews[0].render();
            this.inventoryViews[1].render();
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
    window.App = new jstonkers.controllers.MatchController();
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



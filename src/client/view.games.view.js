var log = debug('client:view:games:view');

jstonkers.client.view.games.View = Backbone.View.extend({

    created: false,

    initialize: function(){
        
        _.bindAll( this, 'createMap' );
        // map = new L.JStonkersMap('map',{});
        // map.on('click', function(e){
            // console.log(e);
            // log( map.layerPointToBlock( map.latLngToLayerPoint(e.latlng)) );
        // });
        // 
        this.on('show', this.createMap );
    },

    render: function(){
        // if( !this.created )
            // this.createMap();
        return this;
    },

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        var data = {};
        var content = Mustache.render( Templates.games.view, data );
        return $(content).get(0);
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
        Backbone.View.prototype.setElement.apply( this, arguments );
        // if( !this.created )
            // this.createMap();
        // log('SET-ELEMENT');
        return this;
    },

    createMap: function(){
        // if( this.created )
        //     return this;
        var map;
        var $map = $('#leaflet-map');
        console.log( $map );
        log( 'this.created? ' + this.created );
        
        if( $.contains(document.body, $map.get(0)) ){
            log('map is in the body');
        } else {
            log('map is NOT in the body');
        }
        // if( $map.size() <= 0 ){// || !$.contains(document.body, $map.get(0) ) ){
        //     log('no #leaflet-map found');
        //     return this;
        // }
        
        try{
            map = new L.JStonkersMap('leaflet-map', {});
            this.map = map;
            this.created = true;
        } catch( err ){
            log( err );
            return false;
        }

        var marker, markerLayer = new L.LayerGroup();
        
        // L.DivIcon
        var TestIcon = L.DivIcon.extend({
            options: {
                className: 'test-icon tank sprite',
                iconSize: new L.Point(32, 16)
            }
        });


        // var MarkerIcon = L.Icon.Default.extend({
        //     options: {
        //         iconUrl: "../web/img/leaflet/marker.png",
        //         shadowUrl: "../web/img/leaflet/marker-shadow.png"
        //     }
        // });

        marker = new L.Marker( this.map.worldToMap([1200,1000]), {draggable:true,icon:new TestIcon()} );
        markerLayer.addLayer(marker);
        // marker = new L.Marker( map.worldToMap([1000,1000]), {icon:new MarkerIcon()} );
        // markerLayer.addLayer(marker);
        this.map.addLayer(markerLayer);

        log('created map');
    }
});
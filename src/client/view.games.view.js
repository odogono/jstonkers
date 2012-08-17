var log = debug('client:view:games:view');

jstonkers.client.view.Unit = Backbone.View.extend({
    initialize: function(){
        this.map = this.options.map;
        this.team = this.model.get('team');

        var spriteData = jstonkers.client.sprites;
        var zoom = this.map.getZoom()-2;
        zoom = 0;
        var teamIndex = this.team.get('teamIndex');
        // this.zoom = this.view.zoom;
        var offset = spriteData.offsets[ teamIndex ][ zoom ];
        var uvs = spriteData.uvs[ zoom ][ this.model.type ];

        // L.DivIcon
        var TestIcon = L.DivIcon.extend({
            options: {
                className: 'test-icon sprite zoom_' + (zoom+1),
                iconSize:[uvs[2],uvs[3]],
                bgPos:{x:(uvs[0]+offset[0]), y:(uvs[1]+offset[1]) }
            }
        });
        var icon = new TestIcon();
        var position = this.map.worldToMap( this.model.get('position') );
        this.marker = new L.Marker( position, {draggable:true,icon:new TestIcon()} );

        console.log( this.marker );
        // this.el.style.backgroundPosition = -(this.uvs[0]+this.offset[0]) + 'px ' + -(this.uvs[1]+this.offset[1]) + 'px';
        // $(this.el).css({width:this.uvs[2], height:this.uvs[3]});
    },

    render: function(){
        // log('unit render');
        return this;
    },

    make: function(tagName, attributes, content) {
        // log('unit make');
        return null;
    }
});



jstonkers.client.view.games.View = Backbone.View.extend({

    created: false,

    initialize: function(){
        _.bindAll( this, 'createMap' );

        // a map of unit ids to view.Unit instances
        this.units = {};

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
        var self = this;
        if( this.created )
            return this;
        // var map;
        var $map = $('#leaflet-map');
        
        if( $.contains(document.body, $map.get(0)) ){
            log('map is in the body');
        } else {
            log('map is NOT in the body');
        }
        // if( $map.size() <= 0 ){// || !$.contains(document.body, $map.get(0) ) ){
        //     log('no #leaflet-map found');
        //     return this;
        // }
        
        if( !this.created ){
            try{
                this.map = new L.JStonkersMap('leaflet-map', {});
                this.unitLayer = new L.LayerGroup();
                this.map.addLayer(this.unitLayer);
                this.created = true;
            } catch( err ){
                log( err );
                return false;
            }    
        }

        this.map.on('zoomend', function(e){
            console.log('map zoom finished at ' + this.getZoom() );
        });
        
        log('created map ' + this.map.getZoom() );
        var game = this.model.get('game');

        game.units().forEach( function(unit){
            self.createUnit( unit );
        });
    },

    createUnit: function(model){
        var view = new jstonkers.client.view.Unit({map:this.map,model:model});
        this.unitLayer.addLayer(view.marker);
        // log('added view for ' + model.id );
    },

});
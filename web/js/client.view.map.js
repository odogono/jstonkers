;
L.Projection.NoWrap = {
    project: function (latlng) {
        return new L.Point(latlng.lng, latlng.lat);
    },

    unproject: function (point, unbounded) {
        return new L.LatLng(point.y, point.x, true);
    }
};

L.CRS.Direct = L.Util.extend({}, L.CRS, {
    code: 'Direct',
    projection: L.Projection.NoWrap,
    transformation: new L.Transformation(1, 0, 1, 0)
});

// override for tilelayer
L.LatLngBounds.prototype.extend = function (/*LatLng or LatLngBounds*/ obj) {
    if (obj instanceof L.LatLng) {
        if (!this._southWest && !this._northEast) {
            this._southWest = new L.LatLng(obj.lat, obj.lng, true);
            this._northEast = new L.LatLng(obj.lat, obj.lng, true);
        } else {
            this._southWest.lat = Math.max(obj.lat, this._southWest.lat);
            this._southWest.lng = Math.min(obj.lng, this._southWest.lng);
            this._northEast.lat = Math.min(obj.lat, this._northEast.lat);
            this._northEast.lng = Math.max(obj.lng, this._northEast.lng);
        }
    } else if (obj instanceof L.LatLngBounds) {
        this.extend(obj._southWest);
        this.extend(obj._northEast);
    }
    return this;
}



L.JStonkersMap = L.Map.extend({
    // originLatLng: new L.LatLng(0,0),

    initialize: function (id, options) {
        options = _.extend( {
            scrollWheelZoom: false,
            doubleClickZoom: true,
            zoomControl: true,
            attributionControl: false,
            zoom: 3,
            maxZoom: 4,
            minZoom: 3,
            dragging: true,
            worldCopyJump: false, 
            crs: L.CRS.Direct,
            center: new L.LatLng(0.2, 0.31)
        }, options );
        L.Map.prototype.initialize.call( this, id, options );

        this.initializeTileLayer();
    },

    initializeTileLayer: function(){
        var url = 'http://work.localhost/jstonkers/web/img/tiles/a/{z}-{x}-{y}.png';
        var params = { minZoom: -2, maxZoom: 4 };
        this.tileLayer = new L.TileLayer(url, {
            maxZoom: params.maxZoom - params.minZoom, //6
            minZoom: 0,
            zoomOffset: params.minZoom,
            errorTileUrl:'http://work.localhost/jstonkers/web/img/tiles/a/n-n.png',
            // zoomOffset: params.minZoom-1,
            zoomReverse:true, 
            continuousWorld: true});
        this.addLayer(this.tileLayer);

        var maxBounds = new L.LatLngBounds( this.worldToMap([0,1536]), this.worldToMap([2560,0]) );
        // console.debug('maxBounds ' + JSON.stringify(maxBounds));
        this.setMaxBounds( maxBounds );
    },

    worldToMap: function( pos ){
        var conv = this.blockToLayerPoint({x:pos[0],y:pos[1]});
        return this.layerPointToLatLng( conv );
    },

    layerPointToBlock: function(layerPoint){
        var origin = this.originLayerPoint;
        var block = new L.Point(layerPoint.x - origin.x, layerPoint.y - origin.y);
        var zoom = this.tileLayer._getOffsetZoom(this.getZoom());
        if (zoom > 0) {
            block = new L.Point(block.x << zoom, block.y << zoom);
        } else {
            block = new L.Point(block.x >> (zoom * -1), block.y >> (zoom * -1));
        }
        return block;
    },

    blockToLayerPoint: function(block) {
        if( !this.originLayerPoint ){
            this.originLayerPoint = this.latLngToLayerPoint( new L.LatLng(0,0) );
        }
        var zoom = this.tileLayer._getOffsetZoom(this.getZoom());
        
        if (zoom > 0) {
            block = new L.Point(block.x >> zoom, block.y >> zoom);
        } else {
            block = new L.Point(block.x << (zoom * -1), block.y << (zoom * -1));
        }

        var origin = this.originLayerPoint;
        var layerPoint = new L.Point(block.x + origin.x, block.y + origin.y);
        return layerPoint;
    },

    // override to provide blockPoint 
    // urgh.. better way?
    _fireMouseEvent: function (e) {
        if (!this._loaded) { return; }
        var type = e.type;
        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));
        if (!this.hasEventListeners(type)) { return; }
        if (type === 'contextmenu') {
            L.DomEvent.preventDefault(e);
        }

        var containerPoint = this.mouseEventToContainerPoint(e),
            layerPoint = this.containerPointToLayerPoint(containerPoint),
            latlng = this.layerPointToLatLng(layerPoint),
            blockPoint = this.layerPointToBlock(layerPoint);

        this.fire(type, {
            latlng: latlng,
            layerPoint: layerPoint,
            containerPoint: containerPoint,
            blockPoint: blockPoint,
            originalEvent: e
        });
    },

    // overriden to prevent _boundsMinZoom from being set
    setMaxBounds: function (bounds) {
        this.options.maxBounds = bounds;
        if (!bounds) {
            this._boundsMinZoom = null;
            return this;
        }
        if (this._loaded) {
            // if (this._zoom < minZoom) {
                // console.log('going inside ' + bounds.getCenter() );
                // this.setView(bounds.getCenter(), minZoom);
            // } else {
                // console.log('pan inside');
                this.panInsideBounds(bounds);
            // }
        }

        return this;
    },

    setView: function (center, zoom, forceReset) {
        // map.worldToMap([1000,1000]);
        L.Map.prototype.setView.call( this, center, zoom, forceReset );
    }

});
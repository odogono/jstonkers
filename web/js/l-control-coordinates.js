L.Control.Coordinates = L.Control.extend({
    options: {
        position: 'topright'
    },


    onAdd: function (map) {
        var self = this;
        this._container = L.DomUtil.create('div', 'leaflet-control-coordinates');
        L.DomEvent.disableClickPropagation(this._container);
        this._container.innerHTML = '<div class="coord-row"><span class="label">X:</span> <span name="x" class="value">0</span></div><div class="coord-row"><span class="label">Z:</span> <span name="y" class="value">0</span></div>';
        this._$x = $('span[name="x"]', this._container );
        this._$y = $('span[name="y"]', this._container );

        map
            .on('mousemove', function(e){
                self._$x.text( e.blockPoint.x );
                self._$y.text( e.blockPoint.y );
            });//*/
        return this._container;
    }
});
var fs = require('fs'),
    assert = require('assert');

// Collision Map
// not for client use
jstonkers.model.CMap = Backbone.Model.extend({
    
    initialize: function() {
        
    },
    
});

jstonkers.model.createCMap = function( options ) {
    var result = new jstonkers.model.CMap();
    
    if( options.data ) {
        // attempt to load the data
        if( path.existsSync(options.data) && fs.statSync(options.data).isFile() ){
            var fileData = fs.readFileSync( options.data );
            var ds = jstonkers.utils.DataBuffer.createDataBuffer( fileData );
            
            assert.ok( ds.readString(4) == 'CMAP' );
            
            result.width = ds.readInt();
            result.height = ds.readInt();
            result.data = ds.readBytes();
        }
        
        
    }
    
    return result;
};
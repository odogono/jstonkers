// Server-side entity functions
var entity = require('./entity');

_.extend( entity.Entity.prototype, {
    storeKeys: function(){
        return [ 'created_at', 'updated_at' ];
    }
});
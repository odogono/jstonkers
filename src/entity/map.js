var entity = require('./entity');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#map';


exports.entity = entity.Entity.extend({
});




exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'map'}, attrs) );
    return result;
}
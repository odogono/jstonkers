var JSTEntity = require_entity('jst_entity');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#map';
exports.type = 'map';

exports.Entity = JSTEntity.Entity.extend({
});




exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:'map'}, attrs) );
    return result;
}
var Entity = require('./entity');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#unit';


exports.entity = entity.Entity.extend({
});


exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'unit'}, attrs) );
    return result;
});
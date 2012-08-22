var entity = require('./entity');
var unit = require('./unit');

exports.type = 'tank';

exports.entity = unit.entity.extend({
    defaults: _.extend(unit.entity.prototype.defaults,{
    }),
});


exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:exports.type}, attrs) );
    return result;
}
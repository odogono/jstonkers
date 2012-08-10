var entity = require('./entity');
var unit = require('./unit');

exports.type = 'ship';

exports.entity = unit.entity.extend({

});


exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:exports.type}, attrs) );
    return result;
}
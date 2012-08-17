var Entity = require('./entity');
var Unit = require('./unit');

exports.type = 'supply';

exports.entity = Unit.entity.extend({

});


exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:exports.type}, attrs) );
    return result;
}
var Entity = require('./entity');
var Unit = require('./unit');

exports.type = 'supply';

exports.Entity = Unit.Entity.extend({

});


exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:exports.type}, attrs) );
    return result;
}
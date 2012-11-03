var Entity = require('odgn-entity');
var JSTEntity = require_entity('jst_entity');
var Unit = require('./unit');

exports.type = 'ship';

exports.Entity = Unit.Entity.extend({

});


exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:exports.type}, attrs) );
    return result;
}
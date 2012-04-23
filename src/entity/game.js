var base = require('./entity');

exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';

exports.entity = base.entity.extend({
    initialize: function(){
        var self = this;
        // this.constructor.__super__.initialize.call(this);
        // log('hmmm');
        // print_ins( this );
    }
});
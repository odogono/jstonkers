var entity = require('./entity');

exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';

exports.ER = [
    { oneToMany:"#team", name:"teams" },
    { oneToOne:"#map" }
];

exports.entity = entity.Entity.extend({
    initialize: function(){
        var self = this;
        // this.constructor.__super__.initialize.call(this);
        // log('hmmm');
        // print_ins( this );
    }
});
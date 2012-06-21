var entity = require('./entity');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#team';

exports.ER = [
    { oneToMany:"unit", name:"units" }
];

exports.entity = entity.Entity.extend({
    initialize: function(){
        // log('oh boy! ' + this.game.id );
    }

});
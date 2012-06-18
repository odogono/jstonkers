var Entity = require('./entity');
var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

// Common.entity.addEntityPath( Common.paths.commands );
// Common.entity.registerEntity('cmd_game');

// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';

exports.ER = [
    { oneToMany:"team", name:"teams" },
    { type:'cmd_queue', name:"cmds" },
    // { oneToMany:"user", name:"spectators" }
    // { oneToOne:"map" }
];

exports.entity = Entity.Entity.extend({
    initialize: function(){
        var self = this;
        this.cmds.on('add', function(cmd){
            cmd.game = self;
        });
        // add the default game command
        // this.cmds.add( {type:'cmd_init_game'} );
    },


    process: function( options, callback ){
        return this.cmds.process( options, callback );
    },

    isAGame: function(){
        return true;
    }
});

exports.create = function(attrs, options){
    var result = Entity.create( _.extend({type:'game'}, attrs) );
    // var result = new exports.entity( attrs, options );
    return result;
};


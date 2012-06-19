var entity = require('./entity');
var CommandQueue = require( '../command_queue' );

// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';

exports.ER = [
    { oneToMany:"team", name:"teams" },
    { type:'cmd_queue', name:"cmds" },
    // { oneToMany:"user", name:"spectators" }
    // { oneToOne:"map" }
];

exports.entity = entity.Entity.extend({
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
    options = (options || {});
    var result = entity.create( _.extend({type:'game'}, attrs) );

    if( options.statePath ){
        var state = require( options.statePath );
        state = result.parse(state,null,{parseFor:'game'});
        result.set( state );
    }

    return result;
};


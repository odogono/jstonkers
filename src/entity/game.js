var fs = require('fs');
var entity = require('./entity');
var CommandQueue = require( '../command_queue' );


// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';
exports.type = 'game';

exports.ER = [
    { oneToMany:"team", name:"teams" },
    { type:'cmd_queue', name:"cmds" },
    // { oneToMany:"user", name:"players" },
    // { oneToMany:"user", name:"spectators" }
    // { oneToOne:"map" }
];

exports.entity = entity.Entity.extend({
    initialize: function(){
        var self = this;
        this.teams.on('add', function(team){
            team.game = self;
        });
        this.cmds.on('add', function(cmd){
            cmd.game = self;
        });
        this.teams.on('change:user', function(team){
            // log('team evt ' + JSON.stringify(arguments) );
        });
        // add the default game command
        // this.cmds.add( {type:'cmd_init_game'} );
    },

    isAGame: function(){
        return true;
    },

    // 
    // Returns an array of users controlling the teams
    // 
    users: function(){
        var user, result = [];
        if( (user = this.teams.at(0).get('user')) )
            result.push(user);
        if( (user = this.teams.at(1).get('user')) )
            result.push(user);
        return result;
    },

    // 
    // returns true if the user is controlling one of the teams
    // 
    isUserInvolved: function(user){
        var existing = this.users();
        return !!_.find( existing, function(u){ return u.equals(user); } );
    },
});

exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'game'}, attrs) );

    if( options.statePath ){
        // log('loading state from ' + options.statePath );
        var state = JSON.parse( fs.readFileSync( options.statePath ) );
        state = result.parse(state,null,{parseFor:'game'});
        
        result.set( state );
    }

    return result;
};


var fs = require('fs');
var entity = require('./entity');
var CommandQueue = require( '../command_queue' );

// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';

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
        // add the default game command
        // this.cmds.add( {type:'cmd_init_game'} );
    },

    process: function( options, callback ){
        return this.cmds.process( options, callback );
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

    // 
    // 
    // 
    addUser: function(user, team){
        // print_var( this );
        // check hasn't already been added
        if( this.isUserInvolved(user) )
            return this;

        if( !team ){
            team = this.teams.at(0);
            if( !team.isAI() )
                team = this.teams.at(1);
        }

        // log('adding to team ' + team.cid );

        return team.setUser( user );
    },

    removeUser: function(user){
        this.teams.at(0).setUser( null );
        this.teams.at(1).setUser( null );
    }

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


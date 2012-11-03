var Entity = require('odgn-entity');
var JSTEntity = require_entity('jst_entity');
var fs = require('fs');
var CommandQueue = require( '../command_queue' );

// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#game';
exports.type = 'game';

exports.ER = [
    { oneToMany:'team', name:'teams', inverse:'game' },
    { type:'cmd_queue', name:'cmds', inverse:'game' },
    // { oneToMany:"user", name:"players" },
    // { oneToMany:"user", name:"spectators" }
    // { oneToOne:"map" }
];

exports.Entity = JSTEntity.Entity.extend({
    initialize: function(){
        var self = this;

        this.teams.on('add', function(team){
            if( _.isUndefined(team.get('teamIndex')) ){
                team.set('teamIndex', self.teams.length );
                log('added teamIndex ' + team.get('teamIndex') );
            }
        })
        .on('reset', function(evt){
            var teams = this.models();
            for( var i in teams ){
                teams[i].set('teamIndex', i);
            }
        });

        this.teams.on('change:user', function(team){
            // log('team evt ' + JSON.stringify(arguments) );
        });
    },

    onAddTeam: function(team){
        log('added team ' + team.id );
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

    /**
     * Returns all the units in the game
     * @return {Array}
     */
    units: function(){
        return this.teams.at(0).units.models().concat( this.teams.at(1).units.models() );
    }
});

exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:'game'}, attrs) );

    if( options.statePath ){
        // log('loading state from ' + options.statePath );
        var state = JSON.parse( fs.readFileSync( options.statePath ) );
        state = result.parse(state,null,{parseFor:'game'});
        
        result.set( state );
    }

    return result;
};


// Server-side entity functions
var Game = require('./game');

_.extend( Game.Entity.prototype, {

    onStart: function(){
        log('game has started');
    },

    /**
     * [process description]
     * @param  {[type]}   dt       [description]
     * @param  {[type]}   options  [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    process: function( dt, options, callback ){
        if( _.isFunction(options) ){
            callback = options; options = {};
        }
        return this.cmds.process( options, callback );
    },


    /**
     * [addUser description]
     * @param {[type]} user [description]
     * @param {[type]} team [description]
     */
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
        // log('triggering user-joined');
        this.trigger('game.team:user-joined', this, team, user );

        return team.setUser( user );
    },

    removeUser: function(user){
        this.teams.at(0).setUser( null );
        this.teams.at(1).setUser( null );
    },


    addObserver: function( user ){

    },

    removeObserver: function( user ){
        
    }

});
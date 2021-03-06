var fs = require('fs');
var entity = require('./entity');

exports.type = 'game_manager';
exports.ER = [
    { oneToMany:"game", name:"games" },
    { type:'cmd_queue', name:"cmds" },
    { oneToOne:'user' }
];

exports.entity = entity.Entity.extend({

    initialize: function(){
        var self = this;
        // entity.Entity.prototype.initialize.apply(this,arguments);
        this.cmds.on('add', function(cmd){
            cmd.manager = self;
        });
        this.games.on('add', function(game){
            self.trigger('game:added', game);
            game.teams.each( function(team){
                var user;
                if( (user = team.get('user')) ){
                    self.trigger('game.team.user:joined', game, team, user );
                    Backbone.EventBus.trigger('game.team.user:joined', game, team, user );
                }
            });
        });
        this.games.on('remove', function(game){
            game.teams.each( function(team){
                var user;
                if( (user = team.get('user')) )
                    self.trigger('game.team.user:left', game, team, user );
            });
            self.trigger('game:removed', game);
        })
        this.games.on('all', function(type){
            // log('gm all ' + type );
            // self.trigger.apply(self, arguments);
        });
    },

    createGame: function(user, options, callback){
        if( _.isFunction(options) ){
            callback = options;
        }
        
        user = user || this.get('user');
        options = options || {};

        var stateFile = options.stateFile || 'game_a';
        var self = this, statePath = Common.path.join( Common.paths.data, 'states', stateFile + '.json');
        var game = jstonkers.entity.Game.create( null,{statePath:statePath});
        
        game.addUser( user );
        // print_var( self );
        // print_ins( callback );

        game.saveRelatedCB(function(err,result){
            // print_ins( arguments );
            // log('finished saving game ' + result.id );
            // res.json( {status:jstonkers.Status.ACTIVE, game_id:game.id, game_count:app.gameManager.games.length} );
            self.games.add( game );
            // print_var( self );
            // log( 'added game ' + game.id );
            callback( null, game, self );
        });
    },

    destroyGame: function( gameId, callback ){
        if( _.isObject(gameId) )
            gameId = gameId.id;
        var game = this.games.get( gameId );
        if( !game ){
            callback( { name:'not found', message:'game ' + gameId + ' not found', gameId:gameId } );
            return;
        }
            // throw ;
        game.destroyRelatedCB( {destroyHard:true}, function(err,result){
            callback( err, result );
        });
    },

    // 
    // 
    // 
    getState: function( user, gameId ){
        var game = this.games.get(gameId);
        var flattenOptions = { toJSON:true, exclude:{type:'cmd_queue'} };
        // TODO : return game state suitable for particular user - be they participant or guest

        // TODO : return game state without internal entity references
        var result = game.flatten( flattenOptions );
        // print_var(result);
        return result;
    },

    getSummary: function( user, gameId ){
        var game = this.games.get(gameId);
        // print_var( this.games.map(function(game){
        //     return this.id;
        // }));
        if( !game )
            throw new Error('game ' + gameId + ' not found');

        return game.toJSON({relations:false});
    },

    // 
    // 
    // 
    getGame: function(gameId){
        return this.games.get(gameId);
    },

    // 
    // Returns an array of summaries for each of the games
    // 
    getSummaries: function(options){
        return this.games.map( function(game){
            return {
                id:game.id, 
                description:game.get('description'), 
                time:game.get('time'),
                status:game.get('status')
            };
        });
    },

    // the main event loop
    process: function( dt, startTime, now, options, callback ){
        var self = this;
        // log('gameManager.process ' + dt + ' ' + now );
        Step(
            function processGames(){
                var group = this.group();
                self.games.each( function(game){
                    game.process(options, group());
                });        
            },
            function processCommands(){
                self.cmds.process( options, this );
            },
            function(err, result){
                callback( err );
            }
        );
    },

    // 
    // 
    // 
    loadState: function( statePath, options, callback ){
        var self = this;
        var callback = _.isFunction(options) ? options : callback || (options ? options.callback : null);
        options = options || {};
        
        var parseFor = options.parseFor || 'gm.001';
        var state = JSON.parse( fs.readFileSync( statePath ) );

        // print_var( result );
        self.set( self.parse(state,null,{parseFor:parseFor}) );
        /*if( options.debug )*/ log( self.cid + ' loaded gm state from ' + statePath );

        if( options.restore ){
            Step(
                function(){
                    self.fetchRelatedCB( this );        
                },
                function(err,existing){
                    if( err ){
                        // doesn't exist - go for saving instead
                        self.saveCB(this);
                    }else{
                        this();
                    }
                }, 
                function(err,saved){
                    if( callback )
                        callback();
                }
            );
        }else{
            if( callback )
                callback();
        }

        return self;
    }
});

exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'game_manager'}, attrs) );
    if( options.statePath ){
        result.loadState( options.statePath, options );
    }
    return result;
};
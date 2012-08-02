var fs = require('fs');
var entity = require('./entity');

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
        this.games.on('all', function(type){
            self.trigger.apply(self, arguments);
        });
    },

    createGame: function(user, options, callback){
        if( _.isFunction(options) ){
            callback = options;
        }
        if( !user ){
            user = this.get('user');
        }

        options = options || {};

        var self = this, statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json');
        var game = jstonkers.entity.Game.create( null,{statePath:statePath});
        // game.set('created_by', user);
        // print_var( game );
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

    getGame: function(gameId){
        return this.games.get(gameId);
    },

    // the main event loop
    process: function( options, callback ){
        Step(
            function processGames(){
                var group = this.group();
                this.games.each( function(game){
                    game.process(options, group());
                });        
            },
            function processCommands(){
                this.cmds.process( options, this );
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
        if( options.debug ) log('loaded gm state from ' + statePath );

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
var entity = require('./entity');

exports.ER = [
    { oneToMany:"game", name:"games" },
    { type:'cmd_queue', name:"cmds" }
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

    createGame: function(options,callback){
        if( _.isFunction(options) ){
            callback = options;
        }
        options = (options || {});
        var self = this, statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json');
        var game = Common.entity.Game.create(null,{statePath:statePath});
        game.saveRelatedCB(function(err,result){
            // print_ins( arguments );
            // log('finished saving game ' + )
            // res.json( {status:Common.Status.ACTIVE, game_id:game.id, game_count:app.gameManager.games.length} );
            self.games.add( game );
            log( 'added game ' + game.id );
            callback( null, game );
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
    }
});

exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'game_manager'}, attrs) );
    if( options.statePath ){
        var state = require( options.statePath );
        result.set( result.parse(state,null,{parseFor:'game_manager'}) );    
    }
    return result;
};
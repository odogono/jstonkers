var Entity = require('./entity');

exports.ER = [
    { oneToMany:"game", name:"games" },
    { type:'cmd_queue', name:"cmds" }
];

exports.entity = Entity.Entity.extend({

    initialize: function(){
        var self = this;
        this.cmds.on('add', function(cmd){
            cmd.manager = self;
        });
        this.games.on('all', function(type){
            self.trigger.apply(self, arguments);
        });
    },

    createGame: function(attrs,options){
        var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json');
        var game = Common.entity.Game.create(attrs,{statePath:statePath});
        this.games.add( game );
        return game;
    },

    destroyGame: function( gameId ){
        var game = this.games.get( gameId );
        if( !game )
            throw { name:'not found', message:'game ' + gameId + ' not found', gameId:gameId };
        
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
    var result = Entity.create( _.extend({type:'game_manager'}, attrs) );
    if( options.statePath ){
        var state = require( options.statePath );
        result.set( result.parse(state,null,{parseFor:'game_manager'}) );    
    }
    return result;
};


Entity.registerEntity('game_mgnr', exports.entity, {oneToMany:true,create:exports.create} );
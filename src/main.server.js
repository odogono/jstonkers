
Common.entity = require('./entity/entity');
Common.entity.EntityCollection = require('./entity/entity_collection').EntityCollection;

_.extend(Common.entity, require('./entity/entity_relationship') );

Common.sync = require('./sync');

// add server specific functions to entity
// _.extend( Common.entity.Entity.prototype, require('./entity/entity.server').Entity );
require('./entity/entity.server');


Common.entity.CommandQueue = require('./command_queue');
// var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

Common.entity.registerEntity('unit');
Common.entity.registerEntity('team');
var Game = Common.entity.registerEntity('game');
// _.extend( Game.entity.prototype, require('./entity/game.logic').functions );
require('./entity/game.logic');


Common.entity.registerEntity('game_manager');


// load commands
require( Common.paths.commands );



exports.initialize = function(options,callback){
    if( _.isFunction(options) ){
        callback = options;
    }
    options = (options || {});
    
    // boot the game manager
    var gameManager = exports.gameManager = Common.entity.GameManager.create(null,{
        statePath:Common.path.join( Common.paths.data, 'states', 'game_manager.json')
    });

    Step(
        function(){
            gameManager.fetchRelatedCB( this );        
        },
        function(err,result){
            if( err ){
                // log(err);
                // doesn't exist - go for saving instead
                gameManager.saveCB(this);
            }else{
                this();
            }
        }, 
        function(err,result){
            // print_ins( arguments );
            log('finished initialising');
            if( callback )
                callback();
        }
    );
    
}

// print_var( gameManager );
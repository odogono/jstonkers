
Common.Vector2f = require('./vector2f');
Common.PriorityQueue = require('./priority_queue');

Common.entity = require('./entity/entity');
Common.entity.EntityCollection = require('./entity/entity_collection').EntityCollection;
Common.entity.createCollection = require('./entity/entity_collection').create;

_.extend(Common.entity, require('./entity/entity_relationship') );

Common.sync = require('./sync');

// add server specific functions to entity
require('./entity/entity.server');


Common.entity.CommandQueue = require('./command_queue');

Common.entity.registerEntity('unit');

Common.entity.registerEntity('map');
require('./entity/map.path_finding');
require('./entity/map.server');

Common.entity.registerEntity('team');

var Game = Common.entity.registerEntity('game');
require('./entity/game.logic');


Common.entity.registerEntity('game_manager');


// load commands
require( Common.paths.commands );


Common.EventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
Common.EventBus.bind( 'all', function(){
    // var args = Array.prototype.slice.call(arguments,0);
    console.log(arguments);
});
Common.EventBus.emit = Common.EventBus.trigger;


process.on('exit', function() {
  // Add shutdown logic here.
  log('shutting down');
});

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
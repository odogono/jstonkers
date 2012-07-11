jstonkers = {};

jstonkers.status = {
    ACTIVE: 'atv',
    INACTIVE: 'iat',
    DISABLED: 'dis',
    LOGICALLY_DELETED: 'ldl',
};

jstonkers.Vector2f = require('./vector2f');
jstonkers.PriorityQueue = require('./priority_queue');

jstonkers.entity = require('./entity/entity');
jstonkers.entity.EntityCollection = require('./entity/entity_collection').EntityCollection;
jstonkers.entity.createCollection = require('./entity/entity_collection').create;

_.extend(jstonkers.entity, require('./entity/entity_relationship') );

jstonkers.sync = require('./sync');

// add server specific functions to entity
require('./entity/entity.server');


jstonkers.entity.CommandQueue = require('./command_queue');

jstonkers.entity.registerEntity('unit');

jstonkers.entity.registerEntity('map');
require('./entity/map.path_finding');
require('./entity/map.server');

jstonkers.entity.registerEntity('team');

var Game = jstonkers.entity.registerEntity('game');
require('./entity/game.logic');

jstonkers.entity.registerEntity('user');

var GameManager = jstonkers.entity.registerEntity('game_manager');


// load commands
require( Common.paths.commands );


jstonkers.eventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
jstonkers.eventBus.bind( 'all', function(){
    console.log(arguments);
});
jstonkers.eventBus.emit = jstonkers.eventBus.trigger;


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
    var statePath = Common.path.join( Common.paths.data, 'states', 'game_manager.json');
    var gameManager = exports.gameManager = GameManager.create(null,
        {statePath:statePath, restore:true, callback:callback});

}

// print_var( gameManager );
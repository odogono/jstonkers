jstonkers = {
    Status:{
        ACTIVE: 'atv',
        INACTIVE: 'iat',
        DISABLED: 'dis',
        LOGICALLY_DELETED: 'ldl',
    },
    Vector2f: require('./vector2f'),
    PriorityQueue: require('./priority_queue'),
};

jstonkers.eventBus = Backbone.EventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
jstonkers.eventBus.bind( 'all', function(type){
    // console.log(arguments);
    log('event_bus: ' + type );
});
jstonkers.eventBus.emit = jstonkers.eventBus.trigger;



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
require('./entity/map.path_finding')( jstonkers.entity.Map );
// require('./entity/map.path_finding');
require('./entity/map.server');

jstonkers.entity.registerEntity('team');
jstonkers.entity.registerEntity( require('./entity/unit_tank') );
jstonkers.entity.registerEntity( require('./entity/unit_ship') );

var Game = jstonkers.entity.registerEntity('game');
require('./entity/game.server');

jstonkers.entity.registerEntity('user');

var GameManager = jstonkers.entity.registerEntity('game_manager');


// load commands
require( Common.paths.commands );


process.on('exit', function() {
  // Add shutdown logic here.
  log('shutting down');
});


var gameManager = exports.gameManager = GameManager.create();


exports.initialize = function(options,callback){
    if( _.isFunction(options) ){
        callback = options;
    }
    options = (options || {});
    
    // boot the game manager
    var stateFile = Common.config.game_manager.state || 'game_manager.json';
    var statePath = options.statePath || Common.path.join( Common.paths.data, 'states', stateFile );
    gameManager.loadState(statePath,{restore:Common.config.game_manager.restore}, callback );
    log('game manager ' + gameManager.cid + ' initialised');
}

exports.start = function(options,callback){
    log('starting game manager');

    var runLoopOptions = {};

    var runLoop = function(err){
        if( err ) throw err;
        gameManager.process( runLoopOptions, processCallback );
    }

    var processCallback = function(err){
        if( err ) throw err;
        // process.nextTick( runLoop );
    }

    
    if( Common.config.game_manager.loop_active ){
        var fps = Common.config.game_manager.fps || 30;
        log('game manager loop running at ' + fps + 'fps');
        setInterval( runLoop, (1/fps)*1000 );    
    }
    
    // runLoop();

    if( callback ){
        process.nextTick(function() {
            callback();
        });
    }
}

// print_var( gameManager );
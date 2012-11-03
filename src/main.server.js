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


require_entity = function(name){
    return require( path.join(Common.paths.entity, name) );
}

jstonkers.sync = require('./sync');

// add server specific functions to entity
require('./entity/entity.server');


jstonkers.entity.CommandQueue = require('./command_queue');

jstonkers.entity.registerEntity( require('./entity/unit') );
require('./entity/unit.steering');

jstonkers.entity.registerEntity('map');
require('./entity/map.path_finding')( jstonkers.entity.Map );
require('./entity/map.server');

jstonkers.entity.registerEntity('team');
jstonkers.entity.registerEntity( require('./entity/unit_tank') );
jstonkers.entity.registerEntity( require('./entity/unit_ship') );
Entity.registerEntity( require('./entity/unit_supply') );

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

    var last = Date.now();
    var runLoopOptions = {};
    var fps = Common.config.game_manager.fps || 30;
    var intervalMs = (1/fps)*1000;
    var startTime = 0;

    var runLoop = function(err){
        if( err ) throw err;
        var now = Date.now();
        var dt = now - last;
        last = now;
        startTime += dt;
        gameManager.process( (dt/intervalMs), startTime, now, runLoopOptions, processCallback );
    }

    var processCallback = function(err){
        if( err ) throw err;
        // process.nextTick( runLoop );
    }

    
    if( Common.config.game_manager.loop_active ){
        log('game manager loop running at ' + fps + 'fps');
        setInterval( runLoop, intervalMs );    
    }
    
    // runLoop();

    if( callback ){
        process.nextTick(function() {
            callback();
        });
    }
}

// print_var( gameManager );
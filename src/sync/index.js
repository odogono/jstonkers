var adapters = {
    // File: require('./file'),
    // MongoDB: require('./mongodb'),
    // PostgreSQL: require('./postgresql'),
    // Sqlite: require('./sqlite'),
    Redis: require('./redis')
};

_.extend(module.exports, adapters );

var state = function(){
};

state.adapter = 'redis';
state.defaultSync = exports.Redis;
state.options = {};

/**
*   Override default sync function
*/
Backbone.sync = function(method, model, options){
    // log('inspecting model ' + model.type );
    // log( inspect(model.constructor.prototype) );
    // log('sync called with ' + inspect(arguments) );
    // log( state.defaultSync.info );

    // Look up the type of sync to use
    state.defaultSync.sync( method, model, options );
}

/**
*   Clears out the entire dataset
*/
exports.clear = function( callback, options ){
    state.defaultSync.clear( callback, options );
}

exports.count = function( options, callback ){
    state.defaultSync.count( options, callback );
};

exports.keys = function(callback){
    state.defaultSync.keys( callback );
}

exports.generateUuid = function( callback, options ){
    // log('generate_uuid on');
    state.defaultSync.generateUuid( callback, options );
}

exports.set = function( key, value ){
    if( key === 'override' ){
        if( exports[_.capitalize(value)] ){
            state.adapter = value.toLowerCase();
            state.defaultSync = exports[_.capitalize(value)];
        }
    }
    // else if( adapters[_.capitalize(key)] ){
    //     // set options
    //     state.options[ key.toLowerCase() ] = value;
    // }
}

exports.createSioTokenForSession = function( sessionId, callback ){
    state.defaultSync.createSioTokenForSession( sessionId, callback );
}

exports.getSessionIdFromSioToken = function( sioToken, callback ){
    state.defaultSync.getSessionIdFromSioToken( sioToken, callback );
}

/**
*   Begins buffering sync operations
*/
exports.begin = function(options){
    
}


/**
*   Flushes pending sync operations
*/
exports.flushes = function(options){
    
}
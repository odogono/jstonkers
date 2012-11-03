var Entity = require('odgn-entity');
var JSTEntity = require_entity('jst_entity');

exports.type = 'user';
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#user';

exports.Entity = JSTEntity.Entity.extend({

    storeKeys: function(){
        var keys = entity.Entity.prototype.storeKeys.apply(this,arguments);
        return _.union( [ {key:"sid", unique:true} ], keys );
    }

});

exports.create = function(attrs, options){
    options = (options || {});
    var result = Entity.create( _.extend({type:'user',name:'guest'}, attrs) );
    return result;
}

exports.retrieveByEmail = function(sessionId, options, callback){

};

exports.retrieveBySessionId = function(sessionId, options, callback){
    if( _.isFunction(options) ){
        callback = options;
        options = {};
    }
    var result = exports.create();
    dlog('retrieveBySessionId ' + sessionId );
    result.fetchCB({query:{sid:sessionId}}, function(err,retrieved){
        if( err ){ callback(err); return; }
        if( retrieved.isNew() )
            callback( 'not found' );
        else
            callback(null, retrieved);
    });
    return result;
};


/**
 * Retrieves an existing User entity by its id
 * @param  {[type]}   id       [description]
 * @param  {[type]}   options  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.retrieveById = function( id, options, callback ){
    if( _.isFunction(options) ){
        callback = options;
        options = {};
    }
    return exports.create({id:id}).fetchCB( function(err, result){
        if( err ){ callback(err); return; }
        if( result.isNew() )
            callback( 'not found' );
        else
            callback( null, result );
    });
}



exports.retrieveBySioToken = function( sioToken, options, callback ){
    if( _.isFunction(options) ){
        callback = options;
        options = {};
    }

    var result = exports.create();
    result.fetchCB({query:{sioToken:sioToken}}, function(err,retrieved){
        if( err ){ callback(err); return; }
        if( retrieved.isNew() )
            callback( 'not found' );
        else
            callback(null, retrieved);
    });
    return result;
}
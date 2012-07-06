var entity = require('./entity');

// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#user';

exports.entity = entity.Entity.extend({

    storeKeys: function(){
        var keys = entity.Entity.prototype.storeKeys.apply(this,arguments);
        return _.union( [ {key:"sid", unique:true} ], keys );
    }

});



exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'user'}, attrs) );
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
    log('retrieveBySessionId ' + sessionId );
    result.fetchCB({query:{sid:sessionId}}, function(err,retrieved){
        if( err ){ callback(err); return; }

        if( retrieved.isNew() )
            callback( 'not found' );
        else
            callback(null, retrieved);
    });
    return result;
};
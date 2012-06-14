var Entity = require('./entity/entity');
var EntityCollection = require('./entity/entity_collection');


exports.Command = Entity.Entity.extend({
    execute: function(options,callback){
        // returns true if the command is finished
        return true;
    },

    storeKeys: function(){
        return [ "execute_time" ];
    }
});

exports.CommandQueue = EntityCollection.EntityCollection.extend({
    process: function(options,callback){
        var i, cmd, eTime, time = this.time(), removes = [];
        if( !callback && _.isFunction(options) ){
            callback = options;
        }
        options = (options || {});

        // walk the queue until we meet the first time that is later than the current
        for( var i=0,len=this.items.length;i<len;i++ ){
            cmd = this.items.models[i];
            // eTime = cmd.get('execute_time');
            if( cmd.get('execute_time') > time )
                break;
            this.executeCommand( cmd );            
            removes.push( cmd );
        }

        // remove processed commands
        this.items.remove( removes );

        if( callback ){
            callback(this);
        }

        return removes.length;
    },

    executeCommand: function(cmd){
        if( cmd.execute ){
            cmd.execute();
        }
    },

    comparator: function(cmd){
        // retrieve the execution time
        var cmdTime = cmd.get('time');
        return cmdTime;
    },

    // returns the current time according to the queue
    time: function(){
        return Date.now();
    },

    // flatten: function( options ){
    //     options = (options || {});
    //     var result = EntityCollection.EntityCollection.prototype.flatten.apply( this, arguments );
    //     return result;
    // },
});


exports.create = function( attrs, options ){
    // log('creating command queue with ' + JSON.stringify(attrs) );
    // TODO : create with standard entity create
    attrs = (attrs || {});
    options || (options = {});
    // this option has to be set in order to process any passed items/models
    // correctly
    options.parse = true;
    attrs.created_at = new Date();
    attrs.updated_at = new Date();
    attrs.status = Common.Status.ACTIVE;
    var result = new exports.CommandQueue( attrs, options );
    result.type = 'cmd_queue';
    return result;
}

Entity.registerEntity('cmd_queue', exports.CommandQueue, {oneToMany:true,create:exports.create} );
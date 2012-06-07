var EntityCollection = require('./entity/entity_collection');

exports.CommandQueue = EntityCollection.EntityCollection.extend({

    process: function(options,callback){
        var i, cmd, removes = [];
        if( !callback && _.isFunction(options) ){
            callback = options;
        }
        options = (options || {});

        // walk the queue until we meet the first time that is later than the current
        for( var i=0,len=this.items.length;i<len;i++ ){
            cmd = this.items.models[i];
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

});


exports.create = function( attrs, options ){
    options || (options = {});
    // this option has to be set in order to process any passed items/models
    // correctly
    options.parse = true;
    var result = new exports.CommandQueue( attrs, options );
    return result;
}
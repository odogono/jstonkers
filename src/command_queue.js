var Entity = require('./entity/entity');
var EntityCollection = require('./entity/entity_collection');


exports.Command = Entity.Entity.extend({
    
    // finished with a callback containing: error, boolean indicating that this command has finished and should be disposed of
    execute: function(options,callback){
        if( _.isFunction(options) ){
            callback = options;
        }
        options = (options || {});

        // returns true if the command is finished

        callback( null, true, this );
    },

    // returns an array of properties which should be indexable by the db
    storeKeys: function(){
        return [ "execute_time" ];
    },

    
});

exports.CommandQueue = EntityCollection.EntityCollection.extend({

    initialize: function(){
        var self = this;

        if( EntityCollection.EntityCollection.prototype.initialize.apply(this,arguments) ){
            this.items.comparator = function(cmd){
                // retrieve the execution time
                var cmdTime = cmd.get('execute_time');
                return cmdTime;
            };
        }
    },

    process: function(options,callback){
        var self = this, i, len, cmd, eTime, time = this.time(), removes = [];
        var executeCount = 0;
        var finishedCount = 0;

        if( !callback && _.isFunction(options) ){
            callback = options;
        }

        options = (options || {});

        
        // for( i=0,len=this.items.length;i<len;i++ ){
        //     cmd = this.items.models[i];
        //     // eTime = cmd.get('execute_time');
        //     if( cmd.get('execute_time') > time )
        //         break;
        //     this.executeCommand( cmd );            
        //     removes.push( cmd );
        // }

        Step(
            function executeCommands(){
                var group = this.group();

                // walk the queue until we meet the first time that is later than the current time
                for( i=0,len=self.items.length;i<len;i++ ){
                    cmd = self.items.models[i];

                    if( cmd.get('execute_time') > time )
                        break;

                    if( cmd.execute ){
                        // assume that all commands will finish after their initial execution
                        cmd.isFinished = true;
                        // the result will come back as a callback
                        cmd.execute( null, group() );
                        executeCount++;
                    }
                }
            },
            function destroyFinishedCommands(err,result,cmds){
                var group = this.group();

                for( i=0,len=self.items.length;i<len;i++ ){
                    cmd = self.items.models[i];
                    if( cmd.isFinished )
                        removes.push(cmd);
                }
                
                for( i=0,len=removes.length;i<len;i++ ){
                    if( !removes[i].isNew() )
                        removes[i].destroyCB({destroyHard:true}, group() );
                }
                
            },
            function finishAndReport(err,result){
                if( err ) throw err;
                // remove processed commands
                // NOTE - this has to happen after the commands have been deleted, because
                // the collection reference is required
                self.items.remove( removes );

                if( callback )
                    callback(err,executeCount, removes.length);
            }
        );
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
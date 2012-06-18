var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

exports.type = 'cmd_init_game';

exports.entity = CommandQueue.Command.extend({
    execute: function(options,callback){
        this.isFinished = false;
        callback();
    }
});

exports.isCmdInitGame = function(){
    return true;
}
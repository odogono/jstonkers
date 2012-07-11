var fs = require('fs'),
      mkdirOrig = fs.mkdir,
      mkdirSyncOrig = fs.mkdirSync,
      osSep = process.platform === 'win32' ? '\\' : '/';

// globalise these commonly used
log = Common.log;
inspect = Common.inspect;
assert = Common.assert;
println = log;

print_var = function(arg, options){
    if( !arg )
        log( JSON.stringify({},null,'\t') );
    else if( _.isObject(arg) ){
        if(arg instanceof jstonkers.entity.Entity )
            log( JSON.stringify(arg,null,'\t') );
            // log( JSON.stringify(jstonkers.entity.Factory.toEntityJSON(arg,options),null,'\t') );
        else if( arg instanceof jstonkers.entity.EntityCollection )
            log( JSON.stringify(arg,null,'\t') );
            // log( JSON.stringify(jstonkers.entity.Factory.collectionToJSON(arg, options),null,'\t') );
        else
            log( JSON.stringify(arg,null,'\t') );
    }else    
        log( JSON.stringify(arg,null,'\t') );
}
print_ins = function(arg,showHidden,depth,colors){
    log( inspect(arg,showHidden,depth,colors) );
}
print_stack = function(){
    log( new Error().stack );
}


// converts a backbone style success/error callback options hash to a
// more common callback function
Bjs2Callback = function( next, options ){
    options || (options={});
    return _.extend(options,{
        success:function(model,resp){
            next(null, model, resp);
        },
        error:function(model,err,resp){
            next( err, model, resp);
        }
    });
}

Common.LogLevel = {
    OFF: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
}

Common.LogLevelDescr = ['log', 'error', 'warn', 'info', 'debug'];
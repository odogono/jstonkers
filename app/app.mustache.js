var app = module.parent.exports;
var path = require('path');
var fs = require('fs');
var mustache = require( path.join( Common.paths.jslib, 'mustache' ) );

app.set('view engine', 'mustache');

// hack in partials support
var existing = mustache.Renderer.prototype._partial;
mustache.Renderer.prototype._partial = function(name,context){
    // load the partial from file if the partial doesn't exist or the view cache is disabled
    if( !this._partialCache[name] || !app.enabled('view cache') ){
        var partialRaw = fs.readFileSync( path.join(app.settings.views,name+'.mustache'), 'utf8');
        mustache.compilePartial( name, partialRaw );
    }
    return existing.apply( this, arguments );
};

app.engine('mustache', function(path, options, cb){
    mustache.templateCache = mustache.templateCache || {};

    // if the view cache is enabled, then there is chance the template
    // will be in the cache, otherwise load it from file
    if( !mustache.templateCache[path] || !app.enabled('view cache') ){
        fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            try {
                var renderFn = mustache.compile(str,options);
                mustache.templateCache[path] = renderFn;
                if( options.cb )
                    cb(null,renderFn);
                else
                    cb(null,renderFn(options));
            }
            catch(err) {
                cb(err);
            }
        });
    } else {
        if( options.cb )
            cb(null, mustache.templateCache[path] );
        else
            cb(null, mustache.templateCache[path](options) );
    }
    // TODO - enable some kind of caching   
});
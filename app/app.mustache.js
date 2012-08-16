var app = module.parent.exports;
var path = require('path');
var fs = require('fs');
var Mustache = require( path.join( Common.paths.jslib, 'mustache' ) );

app.set('view engine', 'mustache');

// hack in partials support
var existing = Mustache.Renderer.prototype._partial;
Mustache.Renderer.prototype._partial = function(name,context){
    
    // load the partial from file if the partial doesn't exist or the view cache is disabled
    if( !this._partialCache[name] || !app.enabled('view cache') ){
        var partialRaw = fs.readFileSync( path.join(app.settings.partials,name+'.mustache'), 'utf8');
        Mustache.compilePartial( name, partialRaw );
    }
    return existing.apply( this, arguments );
};

// 
// Returns a partial rendered into a string with the given options (as well as app.locals)
// 
app.partial = function(path, options){
    var locals = _.extend({}, this.locals, options );
    return Mustache.render( '{{>' + path + '}}', locals );
}

app.engine('mustache', function(path, options, cb){
    Mustache.templateCache = Mustache.templateCache || {};

    // if the view cache is enabled, then there is chance the template
    // will be in the cache, otherwise load it from file
    if( !Mustache.templateCache[path] || !app.enabled('view cache') ){
        fs.readFile(path, 'utf8', function(err, str){
            if (err) return fn(err);
            try {
                var renderFn = Mustache.compile(str,options);
                Mustache.templateCache[path] = renderFn;
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
            cb(null, Mustache.templateCache[path] );
        else
            cb(null, Mustache.templateCache[path](options) );
    }
    // TODO - enable some kind of caching   
});
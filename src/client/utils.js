
// hack in partials support to read from the Templates var

var existing = Mustache.Renderer.prototype._partial;
Mustache.Renderer.prototype._partial = function(name,context){

    // load the partial from file if the partial doesn't exist or the view cache is disabled
    if( !this._partialCache[name]  ){
        // convert the name into the Templates namespace
        var parts = name.split(/\//);
        var tmpl = null;
        var result = Templates;

        for( var i in parts ){
            if( result[parts[i]] )
                result = result[parts[i]];
        }

        if( result !== Templates )
            Mustache.compilePartial( name, result );
    }

    return existing.apply( this, arguments );
};


/*
jstonkers.log = function(msg,logStatic){
    var $container = $('#log'),
        $entry = null,
        count = $container.find('li').size();
    // msg = new Date.getTime() + ': ' + msg;
    msg = ': ' + msg;
    if( logStatic ){
        $('#logline').text(msg);
        return;
    }
    if( count < 15 ){
        $entry = $('<li>' + msg + '</li>');
        $container.append($entry);    
    }
    else {
        // find the first child - change it - and add it to the end
        $container.append( $container.find('li:first').text(msg).detach() );
    }
};


// window.clog = console.debug;
var log;

if (window.console && typeof console.log === "function"){
  // use apply to preserve context and invocations with multiple arguments
  clog = log = function () { console.log.apply(console, arguments); };
} else {
  clog = log = function(){ return; }
}//*/


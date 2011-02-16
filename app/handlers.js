var app = module.parent.exports,
    fs = require('fs'),
    path = require('path');

app.get('/view/:matchid', function(req, res) {
    
    var statePath = path.join( app.path.var, 'states', req.params.matchid + '.json' );
    var locals = {
        title:'Match ' + req.params.matchid,
        col_href:'',
        state:null,
        socket_enabled:false,
        // css: [ '/css/lib/less' ],
        javascript: [ 
            // '/js/lib/less-grid',
            '/js/lib/Tween',
              '/js/match_view' ],
    };
    
    if( path.existsSync(statePath) && fs.statSync(statePath).isFile() ) {
        
        var state = JSON.parse( fs.readFileSync( statePath ) );
        locals.state = JSON.stringify(state);
        var mapConfig = app.config.maps[ state.match.map ];
        
        locals.socket_enabled = app.config.socket_server.enabled;
        
        locals.cmap = {
            href:mapConfig.collision.href,
            dims:mapConfig.collision.dims,
            width:mapConfig.collision.dims[0],
            height:mapConfig.collision.dims[1],
        };
        
        locals = app.viewHelpers.gather_options( locals );
        res.render('match/view', { locals:locals });
    }
    else
        res.send( statePath + ' not found');
});

app.get('/test', function(req,res){
    res.sendfile( path.join( app.path.test, 'csstesting', 'index.html' ) );
});

// app.get('/compare/:which', function(req,res){
//     res.sendfile( path.join( app.path.var, req.params.which + '.html' ) );
// });

// app.get('/mst', function(req,res){
//     var layout = fs.readFileSync( path.join( app.path.view, 'layout.mustache'), 'utf8' );
//     log( inspect(layout) );
//     result = Mustache.to_html( layout, {content:'hello <b>world</b>'});
//     res.send( result );
//     res.render('match/view', {msg:'world'});
// });

app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});
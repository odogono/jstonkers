var app = module.parent.exports,
    fs = require('fs'),
    path = require('path');

app.get('/view/:matchid', function(req, res) {
    
    var statePath = path.join( app.path.var, 'states', req.params.matchid + '.json' );
    var locals = {col_href:'',state:null,socket_enabled:false};
    
    if( path.existsSync(statePath) && fs.statSync(statePath).isFile() ) {
        
        var state = locals.state = JSON.parse( fs.readFileSync( statePath ) );
        var mapConfig = app.config.maps[ state.match.map ];
        
        locals.socket_enabled = app.config.socket_server.enabled;
        
        locals.collision_maps = [
            { 
                id:'index',
                href:app.config.maps.index.collision.href,
                dims:app.config.maps.index.collision.dims
            },
            {
                id:'map',
                href:mapConfig.collision.href,
                dims:mapConfig.collision.dims
            }];
        
        // location of the collision image
        // locals.col_href = mapConfig.collision.href;
        // important we set the collision image dimensions, so that the client
        // can quickly set up the read canvas
        // locals.col_dims = mapConfig.collision.dims;
        
        // locals.map_index = app.config.maps.index;
    }
    
    res.render('match/view', { locals:locals });
});



app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});
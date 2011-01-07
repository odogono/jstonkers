var app = module.parent.exports,
    fs = require('fs'),
    path = require('path');

app.get('/view/:matchid', function(req, res) {
    
    var statePath = path.join( app.path.var, 'states', req.params.matchid + '.json' );
    
    if( path.existsSync(statePath) && fs.statSync(statePath).isFile() ) {
        var state = JSON.parse( fs.readFileSync( statePath ) );
        state.socket_enabled = app.config.socket_server.enabled;
    }
    
    res.render('match/view', { locals: {state:state} });
});



app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});
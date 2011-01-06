var app = module.parent.exports,
    fs = require('fs');

app.get('/view', function(req, res) {
    var state = JSON.parse( fs.readFileSync( path.join( app.path.var, 'test', 'matchstate_a.json' ) ) );
    
    state.socket_enabled = app.config.socket_server.enabled;
    
    res.render('match/view', { locals: {state:state} });
});

app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});
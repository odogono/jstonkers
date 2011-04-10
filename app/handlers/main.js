var app = module.parent.exports,
    fs = require('fs'),
    util = require('util'),
    path = require('path');
    
app.get('/test', function(req,res){
    res.send( '<img src="/img/tiles/a/1/1-1.png"/><img src="/img/tiles/a/1/1-2.png"/>' );
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


// app.post('/match/new', function(req,res){
//     log( inspect(req.body,6) );
//     res.send( 200 );
// });

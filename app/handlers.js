var app = module.parent.exports;

app.get('/view', function(req, res) {
    // res.render('string of jade', { options: 'here' });
    // res.render('match/test', { locals: {} });
    res.render('match/view', { locals: {} });
});

app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});
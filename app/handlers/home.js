
exports.index = function(req, res){
    var app = req.app;
    app.locals.appParams.active = 'home';
    if( req.accepts('html') ){
        app.locals.container = app.partial('home', app.locals.appParams );
        res.render( 'main', {appParams:JSON.stringify(app.locals.appParams)} );
    }
    else if( req.accepts('json') ){
        res.json( appParams );
    }
};


// app.get('/userinit', UserMW.load, UserMW.createIfMissing, function(req,res){
//     // print_ins(req);
//     res.json({msg:'thanks', sid:req.sessionID, uid:req.user.id});
// });

// app.get('/testroute', function(req,res){
//     res.json({msg:'good'});
// });
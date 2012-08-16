
exports.index = function(req, res){
    var app = req.app,
        appParams = app.locals.appParams;

    appParams.active = 'home';

    if( req.format == 'html' ){
        app.locals.container = app.partial('home', appParams );
        res.render( 'main', {appParams:JSON.stringify(appParams)} );
    }
    else{ // if( req.accepts('json') ){
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
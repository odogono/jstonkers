
exports.index = function(req, res){
    var app = req.app;
    var appParams = {
        url:{root:'/'},
        active:'home',
        user:{
            id:req.user.id,
            name:req.user.get('name')
        },
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};
    if( req.accepts('html') ){
        app.locals.container = app.partial('home', appParams );
        res.render( 'main', {appParams:JSON.stringify(appParams)} );
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
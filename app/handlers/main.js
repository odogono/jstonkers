// var app = module.parent.exports;
// var UserMW = require('../middleware/user');



exports.index = function(req, res){
    var app = req.app;
    var appParams = {
        url:{root:'/'},
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};
    req.session.location = 'home';

    if( req.accepts('json') ){
        res.json( appParams );
    } 
    else
        res.render( 'main', {appParams:JSON.stringify(appParams)} );
};


// app.get('/userinit', UserMW.load, UserMW.createIfMissing, function(req,res){
//     // print_ins(req);
//     res.json({msg:'thanks', sid:req.sessionID, uid:req.user.id});
// });

// app.get('/testroute', function(req,res){
//     res.json({msg:'good'});
// });
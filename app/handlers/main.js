
exports.all = function(req,res,next){
    var app = req.app,
        config = app.config,
        user = req.user;

    app.locals.appParams = {
        url:{
            'home':'/',
            'root':'/',
            'games.all':'games',
            'games.view':'/games',
        },
        user:{
            id:user.id,
            name:user.get('name')
        },
        server:{
            url:'http://localhost',
            port:config.server.port,
            siotoken: req.siotoken
        }};
    if( req.param('format') ){
        req.format = req.param('format');
    } else {
        req.format = req.accepts(['html','json']);    
    }
    next();
}

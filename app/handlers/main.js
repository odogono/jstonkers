

exports.all = function(req,res,next){
    app.locals.appParams = {
        url:{
            root:'/',
            games:'/games'
        },
        user:{
            id:req.user.id,
            name:req.user.get('name')
        },
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};
    next();
});

var app = module.parent.exports;
var UserMW = require('../middleware/user');

app.get('/', function(req,res){
    
    // var mapConfig = Common.config.maps.spectrum;

    // app.locals.cmap = {
    //     href: Common.path.join(  Common.paths.mapColData, mapConfig.collision.href ),
    //     width: mapConfig.collision.dims[0],
    //     height: mapConfig.collision.dims[1]
    // }
    

    if( req.is('json') )
        res.json({msg:'thanks'});
    else
        res.render( 'match', { msg: "hello there" });
    // res.render( 'match', { msg: "hello there", cb:true }, function(err,render){
    //     log(render);
    //     res.send( render() );
    // });
});



app.get('/userinit', UserMW.load, UserMW.createIfMissing, function(req,res){
    // print_ins(req);
    res.json({msg:'thanks', sid:req.sessionID, uid:req.user.id});
});
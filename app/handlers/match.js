var app = module.parent.exports;

app.get('/', function(req,res){
    
    var mapConfig = Common.config.maps.spectrum;

    app.locals.cmap = {
        href: Common.path.join(  Common.paths.mapColData, mapConfig.collision.href ),
        width: mapConfig.collision.dims[0],
        height: mapConfig.collision.dims[1]
    }
    

    res.render( 'match', { msg: "hello there" });
    // res.render( 'match', { msg: "hello there", cb:true }, function(err,render){
    //     log(render);
    //     res.send( render() );
    // });
});
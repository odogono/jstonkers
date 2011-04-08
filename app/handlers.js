var app = module.parent.exports,
    fs = require('fs'),
    path = require('path');



app.put('/match/:matchid', function(req,res){
    // req.params.matchid
    log( inspect(req.body) );
    var match = new jstonkers.model.Match();
    match.set( match.parse( req.body ), {update:true} );
    match.save();
    
    res.send(200);
});

app.post('/match/new', function(req,res){
    log("received new match request from " + req.session.id );
    
    // create a new match from the specified template, or use the default template
    // var match = new jstonkers.model.Match();
    
    // set the requesting user as the creator, and as the first player
    
    // the match will now start executing
    
    res.send('ok',200);
});

app.get('/match/:matchid', function(req, res) {
    var session = req.session;
    
    if( session.views ){
        log('number of views ' + session.views );
        session.views++;
    }
    else{
        log('new session ' );
        session.views = 1;
    }
    
    var statePath = path.join( app.path.var, 'states', req.params.matchid + '.json' );
    var locals = {
        title:'Match ' + req.params.matchid,
        col_href:'',
        state:null,
        socket_enabled:false,
        // css: [ '/css/lib/less' ],
        javascript: [ 
            // '/js/lib/less-grid',
            '/js/lib/Tween',
              '/js/match_view' ],
    };
    
    
    // match  = new jstonkers.model.Match({id:'popo'});
    
    // TODO AV : chain events from whether success or failure is called
    // Step(
    //     function fetchModel(){
    //         match.fetch({success:this, error:this});
    //     },
    //     function processResult(err,result){
    //         // if( !result ) throw 'not found';
    //         log(inspect(result));
    //     },
    //     function andFinish(err){
    //         log('all done');
    //     }
    // );
    var match = new jstonkers.model.Match({id:req.params.matchid});
    match.fetch({ 
        success: function(model,resp){
            // log('model retrieved');
            // log( inspect(model) );
            if( req.isXMLHttpRequest ){
                res.contentType( 'application/json' );
                res.send( JSON.stringify(model) );
                return;
            }
            
            var mapConfig = app.config.maps[ model.get('match').map ];
            log( inspect(mapConfig,4) );
            locals.state = JSON.stringify(model);
            locals.socket_enabled = app.config.socket_server.enabled;
            locals.cmap = {
                href:mapConfig.collision.href,
                dims:mapConfig.collision.dims,
                width:mapConfig.collision.dims[0],
                height:mapConfig.collision.dims[1],
            };
            log('zoom is ' + model.get('zoom') );
            log('src is ' + model.get('image_src') );
            
            locals.preload_images = [];
            
            image_root_path = path.join( model.get('image_src'), '/' + model.get('zoom') );
            
            // for( x=0;x<5;x++ ){
            //     for( y=0;y<3;y++ ){
            //         locals.preload_images.push( path.join( image_root_path,x + '-' + y + '.png') );
            //     }
            // }
            
            
            locals = app.viewHelpers.gather_options( locals );
            res.render('match/view', { locals:locals });
        },
        error: function(model, response){
            res.send( statePath + ' not found',404);
        }});
    //*/
    
    /*
    if( path.existsSync(statePath) && fs.statSync(statePath).isFile() ) {
        
        if( req.isXMLHttpRequest ){
            res.contentType( 'application/json' );
            res.sendfile( statePath );
            return;
        }
        
        var state = JSON.parse( fs.readFileSync( statePath ) );
        locals.state = JSON.stringify(state);
        var mapConfig = app.config.maps[ state.match.map ];
        
        locals.socket_enabled = app.config.socket_server.enabled;
        
        locals.cmap = {
            href:mapConfig.collision.href,
            dims:mapConfig.collision.dims,
            width:mapConfig.collision.dims[0],
            height:mapConfig.collision.dims[1],
        };
        
        locals = app.viewHelpers.gather_options( locals );
        res.render('match/view', { locals:locals });
    }
    else
        res.send( statePath + ' not found');//*/
});

// app.get('/test', function(req,res){
//     res.sendfile( path.join( app.path.test, 'csstesting', 'index.html' ) );
// });

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

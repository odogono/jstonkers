var app = module.parent.exports,
    fs = require('fs'),
    util = require('util'),
    crypto = require('crypto'),
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
    log("received new match request from " + req.session.id + ' ' + inspect(req.body) );
    
    // match creation requests must come from a valid user
    
    // if no template was specified, then just use a default
    var templateMatch = req.body.templateid ? req.body.templateid : 'testa';
    
    // create a new match from the specified template, or use the default template
    var statePath = path.join( app.path.var, 'states', templateMatch + '.json' );
    if( !path.existsSync(statePath) ){
        util.debug('could not find state at ' + statePath );
        res.send( {ok:false, error:'could not find state at ' + statePath }, 404 );
        return;
    }
    util.debug('loaded state from ' + statePath );
    var matchData = JSON.parse( fs.readFileSync( statePath ) );
    
    // create a new match id
    matchData.id = templateMatch + '-' + uuid();
    
    var match = new jstonkers.model.Match();
    match.set( match.parse( matchData ) );
    match.save();
    
    // set the requesting user as the creator, and as the first player
    req.session.matches = req.session.matches || [];
    req.session.matches.push( match.id );
    
    // the match will now start executing
    util.debug('created match ' + match.id + ' from template ' + templateMatch );
    res.send( { ok:true, id:match.id } ,200);
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
});

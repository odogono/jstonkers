// var app = module.parent.exports;


exports.create = function( req,res ){
    var app = req.app,
        gameManager = app.gameManager;
    
    // is this user allowed to create a new game ?

    // process the arguments for creating the game

    // fetch a default game state
    var game = gameManager.createGame( req.user, function(err,game){

        var appParams = {
        url:{root:'/'},
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};

        // gather details of available games
        appParams.result = {status:jstonkers.Status.ACTIVE, game_id:game.id, game_count:gameManager.games.length};
        appParams.games = gameManager.getSummaries();

        res.json( appParams );
    });
};

// main game page
// if html request, returns a page with the game state enclosed
// if json request, returns a json object of the game state
exports.view = function(req,res){
    var app = req.app,
        gameManager = app.gameManager,
        gameId = req.param('game_id');
    // res.render('error', { status: 404, message: 'Game' + gameId + ' Not Found' });

    var appParams = {
        url:{root:'/'},
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};

    appParams.result = gameManager.getSummary( req.user, gameId );
    appParams.entities = gameManager.getState( req.user, gameId );

    if( req.accepts('html') ){
        res.render( 'match', { msg: "hello there" });
    } else {
        res.json( appParams );
    }
};


exports.viewAll = function(req,res){
    var app = req.app,
        gameManager = app.gameManager;

    // var previews = [
    //     { id:1, name:'game a'},
    //     { id:2, name:'game b'},
    //     { id:3, name:'game c'}
    // ];

    

    // res.render( 'games', { msg: "hello there", previews:previews });
    var appParams = {
        url:{root:'/', games:"/games"},
        active:'games.all',
        server:{
            url:'http://localhost',
            port:app.config.server.port,
            siotoken: req.siotoken
        }};

    // gather details of available games
    appParams.games = gameManager.getSummaries();

    if( req.accepts('html') ){
        app.locals.container = app.partial('game/all', appParams );
        res.render( 'main', {appParams:JSON.stringify(appParams)} );
    }
    else if( req.accepts('json') ){
        res.json( appParams );
    }  
};

exports.delete = function(req,res){
    var app = req.app,
        gameManager = app.gameManager,
        gameId = req.param('game_id');

    gameManager.destroyGame( gameId, function(err, result){
        if( err ){
            print_ins( err );
            throw err;
            // res.render('error', {status:404, message:err.message, game_id:gameId} );
        }else
            res.json({ game_id:gameId });
    });
    
};

// app.get('/', function(req,res){
    
//     var mapConfig = Common.config.maps.spectrum;

//     app.locals.cmap = {
//         href: Common.path.join(  Common.paths.mapColData, mapConfig.collision.href ),
//         width: mapConfig.collision.dims[0],
//         height: mapConfig.collision.dims[1]
//     }

//     res.render( 'match', { msg: "hello there" });
//     // res.render( 'match', { msg: "hello there", cb:true }, function(err,render){
//     //     log(render);
//     //     res.send( render() );
//     // });
// });
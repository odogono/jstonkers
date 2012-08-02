// var app = module.parent.exports;


exports.create = function( req,res ){
    var app = req.app,
        gameManager = app.gameManager;
// app.post('/games/new', UserMW.load, UserMW.createIfMissing, function(req,res){
    // is this user allowed to create a new game ?

    // process the arguments for creating the game

    // fetch a default game state
    var game = gameManager.createGame( req.user, function(err,game){
        res.json( {status:jstonkers.Status.ACTIVE, game_id:game.id, game_count:gameManager.games.length} );
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
    if( req.is('json') )
        res.json({msg:'thanks'});
    else
        res.render( 'match', { msg: "hello there" });
};


exports.viewAll = function(req,res){
    var app = req.app,
        gameManager = app.gameManager;

    var previews = [
        { id:1, name:'game a'},
        { id:2, name:'game b'},
        { id:3, name:'game c'}
    ];

    res.render( 'games', { msg: "hello there", previews:previews });
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
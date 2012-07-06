var app = module.parent.exports;
var UserMW = require('../middleware/user');


app.post('/games/new', UserMW.load, UserMW.createIfMissing, function(req,res){
    // is this user allowed to create a new game ?

    // process the arguments for creating the game

    // fetch a default game state
    var game = app.gameManager.createGame( req.user, function(err,game){
        res.json( {status:Common.Status.ACTIVE, game_id:game.id, game_count:app.gameManager.games.length} );
    });
});

// main game page
// if html request, returns a page with the game state enclosed
// if json request, returns a json object of the game state
app.get('/games/:game_id', function(req,res){
    var gameId = req.param('game_id');
    res.render('error', { status: 404, message: 'Game' + gameId + ' Not Found' });
});



app.delete('/games/:game_id', function(req,res){
    var gameId = req.param('game_id');

    app.gameManager.destroyGame( gameId, function(err, result){
        if( err ){
            print_ins( err );
            throw err;
            // res.render('error', {status:404, message:err.message, game_id:gameId} );
        }else
            res.json({ game_id:gameId });
    });
    
});

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
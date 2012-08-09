var Common = require( '../src/common' ),
    Server = require('../src/main.server');
    http = require('http');
var express = require('express');
var RedisStore = require('connect-redis')(express);

var app = module.exports = express();

var middleware = {
    templates: require('./middleware/templates'),
    user: require('./middleware/user')
};

var handlers = {
    home: require('./handlers/home'),
    game: require('./handlers/game_manager'),
    user: require('./handlers/user')
};


var config = app.config = Common.config;
app.path = Common.paths;

app.store = new RedisStore({prefix:app.config.session.prefix+':'});

program
    .version( Common.version )
    .option('-p, --port <n>', 'port', parseInt)
    .option('-e, --env', 'environment')
    .parse(process.argv);


app.configure( function(){
    app.set('sio_enabled', config.socketio.enabled );
    app.set('view options', {layout:'layouts/main'});
    app.set('views', Common.path.join(__dirname,'views') );
    app.set('partials', Common.path.join(__dirname,'templates') );

    // set up mustache templates
    require('./app.mustache');

    // browserify to include client side js
    if( config.client.browserify ){
        var bundle = require('browserify')( config.client );
        bundle.addEntry(  Common.path.join(Common.paths.src, 'main.client.js') );
        app.use( bundle );
    }

    app.use( middleware.templates({
        src: Common.path.join(__dirname, 'templates'),
        dest: Common.path.join( Common.paths.web, 'templates.js'),
        mount: '/js/templates.js'
    }) );

    app.use( express.cookieParser(config.session.secret) );
    app.use( express.session({ key:config.session.id, secret:config.session.secret, store:app.store }) );
    app.use( express.bodyParser());
    app.use( express.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
    // app.use( middleware.user.loadOrCreate );
    // app.use( function(req,res,next){
    //     app.locals.sio_enabled = false;
    //     next();
    // });

    app.use( app.router );
});

app.configure('test', function(){
    app.use( express.static(app.path.web) );
    app.use( express.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
    // app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});


app.configure('development', function(){
    app.use( express.favicon() );
    app.use( express.static(app.path.web) );
    app.use( express.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
    app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});

app.configure('production', function(){
    app.use( express.errorHandler());
});


app.gameManager = Server.gameManager;


// 
// Handlers - Home
// 
app.get('/', middleware.user.loadOrCreate, handlers.home.index );


// 
// Handlers - Game
// 
app.get('/games/:game_id', middleware.user.loadOrCreate, handlers.game.view );
app.get('/games/?', middleware.user.loadOrCreate, handlers.game.viewAll );
app.delete('/games/:game_id', middleware.user.loadOrCreate, handlers.game.delete );
app.post('/games/new',  middleware.user.loadOrCreate, handlers.game.create );


// 
// Handlers - User
// 

// app.get('/users/:user_id', handlers.user.view );
// app.post('/users/:user_id', handlers.user.update );
// app.get('/users/invite', handlers.user.invite );


// require('./handlers/main');
require('./handlers/game_manager');


var port = program.port || config.server.port;
var portInc = 0;

app.start = function(options,callback){
    options = options || {};
    options.restore = _.isUndefined(options.restore) ? true : options.restore;
    if( config.env.current === 'test' ){
        port += portInc;
    }
    config.server.port = port;
    Step(
        function(){
            Server.initialize(options,this);
        },
        function(){
            app.server.listen(port,this);
        },
        function(err){
            if( err ) throw err;
            log('started on port ' + port + ' in env ' + app.get('env') );// config.env.current );
            portInc++;
            if( callback ) 
                callback();
        }
    );
}

app.stop = function(callback){
    app.server.close(function(){
        if( callback )
            callback();    
    });
}

// log('app server connected');
// print_ins( app.server );
app.on('listening', function(){
    log('app server is listening');
});
app.on('error', function(e){
    log('app server error ' + e );
});
app.on('close', function(){
    log('app server closed');
});

// log('creating app server');
app.server = http.createServer(app);
// log('created app server');

// important that socketio is included after the app.server is created
require('./socketio');

if( !config.server.manualStart )
    app.start();

// console
require('./repl');
//*/

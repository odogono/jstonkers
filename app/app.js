var Common = require( '../src/common' );
var Server = require('../src/main.server');
var http = require('http');
var cookie = require('connect/node_modules/cookie');
var parseSignedCookies = require('connect').utils.parseSignedCookies;

var app = module.exports = express();

app.path = Common.paths;
app.config = Common.config;

program
    .version('0.0.1')
    .option('-p, --port <n>', 'port', parseInt)
    .option('-e, --env', 'environment')
    .parse(process.argv);

app.set('view options', {layout:'layouts/main'});
app.set('views', Common.path.join(__dirname,'views') );

// set up mustache templates
require('./app.mustache');


app.use( express.methodOverride() );
app.use( connect.cookieParser(app.config.session.secret) );
app.use( connect.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
app.use( connect.favicon() );
app.use( connect.static(app.path.web) );


// 
// parses a cookie string
// 
app.parseCookie = function(data){
    return parseSignedCookies(cookie.parse(decodeURIComponent(data)), app.config.session.secret );
}

var RedisStore = require('connect-redis')(express);
app.sessionStore = new RedisStore({prefix:app.config.session.prefix+':'});
app.use(express.session({ 
    key:app.config.session.id,
    store:app.sessionStore }));

if( Common.config.client.browserify ){
    var bundle = require('browserify')( Common.config.client );
    bundle.addEntry(  Common.path.join(Common.paths.src, 'main.client.js') );
    app.use(bundle);
    log('browserify activated');
}

app.gameManager = Server.gameManager;

require('./handlers/main');
require('./handlers/game_manager');

app.configure( function(){
    // Server.initialize();
    // app.gameManager = Server.gameManager;
    // app.enable('view cache')
});

app.configure('development', function(){

});

app.configure('production', function(){

});

/*
// var oldStart = function(){
    var port = program.port || Common.config.server.port;
    log('started on port ' + port + ' in env ' + Common.config.env.current );
    app.server = http.createServer(app);

    // important that socketio is included after the app.server is created
    require('./socketio');

    // app.server = app.listen(port);
    // app.server = http.createServer(app).listen(port);
    app.server.listen(port);
    
// }//*/


var port = program.port || Common.config.server.port;
var portInc = 0;

app.start = function(options,callback){
    options = options || {};
    options.restore = _.isUndefined(options.restore) ? true : options.restore;
    if( Common.config.env.current === 'test' ){
        port += portInc;
    }
    Common.config.server.port = port;
    Step(
        function(){
            Server.initialize(options,this);
        },
        function(){
            app.server.listen(port,this);
        },
        function(err){
            if( err ) throw err;
            log('started on port ' + port + ' in env ' + Common.config.env.current );
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

if( !Common.config.server.manualStart )
    app.start();

// console
require('./repl');
//*/

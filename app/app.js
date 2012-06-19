var Common = require( '../src/common' );
var Server = require('../src/main.server');

var app = module.exports = express.createServer();

app.path = Common.paths;
app.config = Common.config;

program
    .version('0.0.1')
    .option('-p, --port <n>', 'port', parseInt)
    .option('-e, --env', 'environment')
    .parse(process.argv);

app.set('view options', {layout:'layouts/main'});
app.set('view engine', 'mustache');
// app.engine('mustache', mustache );// require( '../web/js/lib/mustache.min.js' ));

app.engine('mustache', function(path, options, cb){
    Common.fs.readFile(path, 'utf8', function(err, str){
        if (err) return fn(err);
        try {
            var renderFn = mustache.compile(str,options);
            if( options.cb )
                cb(null,renderFn);
            else
                cb(null,renderFn(options));
        }
        catch(err) {
            cb(err);
        }
    });
});

app.set('views', Common.path.join(__dirname,'views') );

app.use( express.bodyParser({ uploadDir: Common.paths.uploadDir }) );
app.use( express.methodOverride() );
app.use( connect.cookieParser(app.config.session.secret) );
app.use( connect.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
app.use( connect.favicon() );
app.use( connect.static(app.path.web) );
// app.use( '/img/upload', connect.static(app.path.uploadDir) );
// app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));

var RedisStore = require('connect-redis')(express);
app.use(express.session({ 
    key:app.config.session.id,
    store:new RedisStore({prefix:app.config.session.prefix+':'}) }));

if( Common.config.client.browserify ){
    var bundle = require('browserify')( Common.config.client );
    bundle.addEntry(  Common.path.join(Common.paths.src, 'main.client.js') );
    app.use(bundle);
    log('browserify activated');
}


require('./handlers/main');
require('./handlers/game_manager');

app.configure( function(){
    // log('configuring ma stuff');
    // print_var( Server.gameManager );
    Server.initialize();
    app.gameManager = Server.gameManager;
});

var port = program.port || Common.config.server.port;
log('started on port ' + port + ' in env ' + Common.config.env.current );
app.listen(port);

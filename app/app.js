var Common = require( '../src/common.js' );

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
        var renderFn = mustache.compile(str,options);
        cb(null,renderFn(options));
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

// require('./handlers/iframe');
// require('./handlers/cms');
// require('./handlers/main');
// require('./handlers/uploader');

app.get('/', function(req,res){
    log('received a test');
    // res.send({ok:true, msg:'thanks'});
    res.render( 'match', { msg: "hello there" } );
});


var port = program.port || Common.config.server.port;
log('started on port ' + port + ' in env ' + Common.config.env.current );
app.listen(port);

var fs = require('fs');
var app = module.parent.exports;

app.path = app_paths;
app.config = jstonkers.config;

app.set('view engine', 'mustache');
app.set('views', path.join(__dirname,'views') );

var storePath = jstonkers.config.session.path || process.env.TMPDIR;
log('session path: ' + storePath );
app.sessionStore = new FileSessionStore( {path:storePath, printDebug:true} );


// for parsing JSON request bodies - ends up in req.body
app.use( express.bodyParser() );
app.use( connect.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
// app.use( connect.compiler({ src:app.path.web, enable: ['sass'] }) );
app.use( connect.cookieParser() );
app.use( connect.session({ key:'jstonkers', secret:'jstonkers-secret', store: app.sessionStore}) );
app.use( connect.static(app.path.web) );
    
app.configure('development', function() {
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

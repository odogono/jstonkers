var fs = require('fs');
var app = module.parent.exports;

app.path = app_paths;
app.config = JSON.parse( fs.readFileSync( path.join( app.path.etc, 'config.json' ) ) );

app.set('view engine', 'mustache');
// app.set('view engine', 'haml');
app.set('views', path.join(__dirname,'views') );

// for parsing JSON request bodies - ends up in req.body
app.use( express.bodyDecoder() );
app.use( connect.logger({ format: ":date :response-time\t:method :status\t\t:url" }) );
app.use( connect.compiler({ src:app.path.web, enable: ['sass'] }) );
app.use( connect.cookieDecoder() );
app.use( connect.session({ secret:'jstonkers-secret'}) );
app.use( connect.staticProvider(app.path.web) );

app.configure('development', function() {
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

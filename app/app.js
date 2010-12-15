#!/usr/bin/env node

common = require('./common');
var port = 3000;

var app = express.createServer(
    connect.logger(),
    connect.compiler({ src:dir_public, enable: ['sass'] }),
    connect.cookieDecoder(),
    connect.session()
);

// for spark2 compatibility
module.exports = app;

log("using " + dir_public );

// set the port to use if specified
if( process.argv.length >= 2 )
    port = parseInt(process.argv[2]);


app.use( connect.staticProvider(dir_public) );
app.set('view engine', 'haml');
app.set('views', path.join(__dirname,'views') );

app.configure('development', function()
{
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

// for parsing JSON request bodies - ends up in req.body
app.use(express.bodyDecoder());

app.helpers({
    gather_stylesheets : function()
    {
        return "<link rel='stylesheet' href='/css/main.css' type='text/css' media='screen, projection'>";
    },
    include_js: function( js ) {
        if( _.isArray(js) )
            return _.map( js, function( name ){ return "<script type='text/javascript' src='/js/" + name + ".js'></script>" } ).join("\n");
        else
            return "<script type='text/javascript' src='/js/" + js + ".js'></script>";
    },
    gather_javascripts : function() {
        return this.include_js([
            'vendor/json2.min',
            'vendor/jquery-1.4.4.min',
            'vendor/underscore',
            'vendor/backbone',
            'vendor/jquery.tmpl.min',
            'jstonkers',
            'scroll_view',
            'map_view',
            'app/models',
            'app/collections',
            'app/views',
        ]);
    },
    app_name: "Stonkers!"
});

app.dynamicHelpers({
    page: function(req, res){
        return req.url;
    },
    basepath: function(){
        // "this" is the app, we can
        // dynamically provide the "home"
        // setting to all views
        return this.set('home');
    },
    request: function(req,res){
        return req;
    },
    resource: function(req,res){
        return res;
    }
});


app.get('/view', function(req, res) {
    // res.render('string of jade', { options: 'here' });
    // res.render('match/test', { locals: {} });
    res.render('match/view', { locals: {} });
});

app.post('/match/new', function(req,res){
    log( inspect(req.body) );
    res.send( 200 );
});

app.listen(port);


var io = socketio.listen(app),
		buffer = [];
io.on('connection', function(client){ 
    
    log('client connected');
    
    client.on('disconnect', function(){
        log('client disconnected');
    });
})
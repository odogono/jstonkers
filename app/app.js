#!/usr/bin/env node

common = require('./common');

var app = express.createServer(
    connect.logger(),
    connect.compiler({ src:dir_public, enable: ['sass'] }),
    connect.cookieDecoder(),
    connect.session()
);

log("using " + dir_public );

app.use( connect.staticProvider(dir_public) );
app.set('view engine', 'haml');
app.set('views', path.join(__dirname,'views') );

app.configure('development', function()
{
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
    
});

app.helpers({
    gather_stylesheets : function()
    {
        return "<link rel='stylesheet' href='/css/main.css' type='text/css' media='screen, projection'>";
    },
    include_js: function(js) {
        return "<script type='text/javascript' src='/js/" + js + ".js'></script>";
    },
    gather_javascripts : function() {
        return  this.include_js('vendor/json2.min') + 
                this.include_js('vendor/jquery-1.4.3.min') + 
                this.include_js('vendor/underscore-min') + 
                this.include_js('vendor/backbone-min');
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


app.get('/', function(req, res)
{
    res.render('match/view', { locals: {} });
});

app.listen(3000);
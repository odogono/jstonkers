#!/usr/bin/env node

common = require('./common');

var app = express.createServer(
    connect.logger(),
    connect.compiler({ src:dir_public, enable: ['sass'] }),
    connect.cookieDecoder(),
    connect.session()
);

// for spark2 compatibility
module.exports = app;

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
    include_js: function( js ) {
        if( _(js).is_array() )
            return _.map( js, function( name ){ return "<script type='text/javascript' src='/js/" + name + ".js'></script>" } ).join("\n");
        else
            return "<script type='text/javascript' src='/js/" + js + ".js'></script>";
    },
    gather_javascripts : function() {
        return this.include_js([
            'vendor/json2.min',
            'vendor/jquery-1.4.4.min',
            'vendor/underscore-min',
            'vendor/backbone-min',
            'vendor/jquery.tmpl.min',
            'jstonkers'
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


app.get('/view', function(req, res)
{
    res.render('match/view', { locals: {} });
});

app.listen(3000);
var app = module.parent.exports;

app.helpers({
    gather_stylesheets : function()
    {
        return "<link rel='stylesheet' href='/css/main.css' type='text/css' media='screen, projection'>";
    },
    include_js: function( js ) {
        if( !_.isArray(js) )
            js = [ js ];
        
        return _.map( js, function( name ){
            if( name.indexOf('/') !== 0 )
                name = '/js/' + name;
            return "<script type='text/javascript' src='" + name + ".js'></script>"; 
        }).join("\n");
        
        // }
        //         else {    
        //             return "<script type='text/javascript' src='/js/" + js + ".js'></script>";
        //         }
    },
    gather_javascripts : function() {
        return this.include_js([
            'lib/json2.min',
            'lib/jquery-1.4.4.min',
            'lib/underscore',
            'lib/backbone',
            'lib/jquery.tmpl.min',
            '/socket.io/socket.io',
            'jstonkers',
            'scroll_view',
            'map_view',
            'app/models',
            'app/collections',
            'app/views',
        ]);
    },
    app_name: "Powerful JStonkers!"
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
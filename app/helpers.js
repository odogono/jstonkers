var app = module.parent.exports;

app.helpers({
    
    summink: function(){
        return "OH YEAH";
    },
    
    gather_options: function( additional ){
        additional = additional || {};
        var options = {
            css:[
                '/css/main',
                '/css/match',
            ],
            javascript:[
                'lib/json2.min',
                'lib/jquery-1.5.1.min',
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
            ],
        };
        
        if( app.config.socket_server.enabled )
            options.javascript.push('/socket.io/socket.io');
        if( additional.javascript )
            options.javascript = options.javascript.concat( additional.javascript );
        if( additional.css )
            options.css = options.css.concat( additional.css );
        delete(additional.javascript);
        delete(additional.css);
        options = _.extend( options, additional );
         
        options.css = _.map( options.css, function( name ){
            if( name.indexOf('/') !== 0 )
                name = '/css/' + name;
            return name; 
        });
        
        options.javascript = _.map( options.javascript, function( name ){
            if( name.indexOf('/') !== 0 && name.indexOf('http') !== 0 )
                name = '/js/' + name;
            return name; 
        });
        return options;
    },
    
    gather_stylesheets : function() {
        return [ 
            "<link rel='stylesheet' href='/css/main.css' type='text/css' media='screen, projection'>",
            "<link rel='stylesheet' href='/css/match.css' type='text/css' media='screen, projection'>", 
        ].join("\n");
    },
    
    include_css: function( css ){
        if( !_.isArray(css) )
            css = [ css ];
        return _.map( css, function( name ){
            if( name.indexOf('/') !== 0 )
                name = '/css/' + name;
            return "<link rel='stylesheet' media='all' href='" + name + ".css' />"; 
        }).join("\n");
    },
    
    include_js: function( js ) {
        if( !_.isArray(js) )
            js = [ js ];
        
        return _.map( js, function( name ){
            if( name.indexOf('/') !== 0 && name.indexOf('http') !== 0 )
                name = '/js/' + name;
            return "<script type='text/javascript' src='" + name + ".js'></script>"; 
        }).join("\n");
        
        // }
        //         else {    
        //             return "<script type='text/javascript' src='/js/" + js + ".js'></script>";
        //         }
    },
    gather_javascripts : function() {
        var includes = [
            'lib/json2.min',
            'https://ajax.googleapis.com/ajax/libs/jquery/1.5.0/jquery.min',
            // 'lib/jquery-1.4.4.min',
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
        ];
        if( app.config.socket_server.enabled )
            includes.push('/socket.io/socket.io');
        return this.include_js(includes);
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
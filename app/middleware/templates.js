// 
// Connect middleware for compiling a directory of templates into a single javascript file
// 
// Based on https://github.com/Sugarstack/templ2client/
// 

// var async = require("async");
var fs = require("fs"),
    path = require("path"),
    Step = require('Step');

var scoutDir = function (dir, ext, templates, callback) {

    Step(
        function(){
            fs.readdir( dir, this );
        },
        function(err,files){
            if (err) return callback(err);
            var group = this.group();

            files.forEach(function(filename){
                addFile( filename, dir, ext, templates, group() );
            });  
        },
        function(err,result){
            callback();
        }
    );
};

var addFile = function( file, dir, ext, templates, callback ) {
    var filePath = path.join(dir, file);
    var fileName = path.basename(file, ext);

    fs.stat(filePath, function (err, stats) {
        if (err) return callback(err);

        if (stats.isDirectory()) {
            var newDir = path.join(dir, file);

            templates[file] = {};

            scoutDir(newDir, ext, templates[file], callback);
        } else if (path.extname(file) === ext) {
            fs.readFile(filePath, "utf8", function (err, data) {
                if (err) return callback(err);
                templates[fileName] = data;
                callback();
            });
        } else {
            callback();
        }
    });
};


module.exports = function(options){
    
    options = options || {};

    if (!options.src) throw new Error("Must provide source directory.");
    if (!options.dest) throw new Error("Must provide destination path.");

    options.ext = '.mustache';
    options.varName = 'Templates';

    

    var fn = function (req, res, next) {
        var self = this;
        var templates = {};

        if (req.url.split('?')[0] === (options.mount || '/templates.js')) {
            
            Step(
                function(){
                    scoutDir(options.src, options.ext, templates, this);        
                },
                function(err){
                    if( err ) next( err );
                    res.statusCode = 200;
                    res.setHeader('last-modified', (new Date()).toString() );
                    res.setHeader('content-type', 'text/javascript');
                    res.end( "var " + options.varName + " = " + JSON.stringify(templates) + ";" );    
                }
            );
            /*scoutDir(options.src, options.ext, templates, function (err) {
                if( err ) next( err );
                res.statusCode = 200;
                res.setHeader('last-modified', (new Date()).toString() );
                res.setHeader('content-type', 'text/javascript');
                res.end( "var " + options.varName + " = " + JSON.stringify(templates) + ";" );
            });//*/
        }
        else next();
        /*else {
        // else next()
            scoutDir(options.src, options.ext, templates, function (err) {
                if (err) return next(err);
                var scriptFile = "var " + options.varName + " = " + JSON.stringify(templates) + ";";
                fs.writeFile(options.dest, scriptFile, next);
            });
            // next();
        }//*/
    };

    return fn;
}
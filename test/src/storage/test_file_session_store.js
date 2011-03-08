var testCase = require('nodeunit').testCase;
var fs = require('fs'),
    crypto = require('crypto');


module.exports = testCase({
    setUp: function (callback) {
        // log( inspect(jstonkers.config) );
        // var state = JSON.parse( fs.readFileSync( path.join( app_paths.var, 'test', 'match_state.json' ) ) );
        
        var testPath = this.testPath = path.join( app_paths.var, 'test', 'session' ); 
        this.store = new jstonkers.storage.FileSessionStore( {path:this.testPath, reapInterval: 600000, maxAge: 600000 * 3} );
        
        if( !path.existsSync(this.testPath) )
            fs.mkdirSync(this.testPath);
        
        // clear contents of dir
        fs.readdir( this.testPath, function(err, files){
            files.forEach( function(f){
                // log('removing ' + path.join( testPath, f) );
                fs.unlinkSync( path.join( testPath, f) );
            });
            
            callback();
        });
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testSet: function(test) {
        var testPath = this.testPath;
        var hashedID = crypto.createHash('md5').update('ABC1').digest('hex');
        var filename = this.store.prefix + hashedID;
        var value = {test:"value", lastAccess:+new Date()};
        
        this.store.set('ABC1', value, function(){
            // check the file was created
            test.ok( path.existsSync(path.join( testPath, filename)));
            
            // check the file content matches
            test.deepEqual( value, JSON.parse( fs.readFileSync( path.join( testPath, filename ) ) ) );
            // log(inspect( JSON.parse( fs.readFileSync( path.join( testPath, filename ) ) ) ));
            test.done();
        });
    },
    
    testGet: function(test){
        var testPath = this.testPath;
        var hashedID = crypto.createHash('md5').update('gettest').digest('hex');
        var filename = this.store.prefix + hashedID;
        var value = {message:"hello", target:"world", lastAccess:+new Date()};
        
        fs.writeFileSync( path.join(testPath,filename), JSON.stringify(value) );
        
        this.store.get('gettest', function(err, data){
            test.deepEqual( value, data );
            test.done();
        });  
    },
    
    
    testDestroy: function(test){
        var testPath = this.testPath;
        var hashedID = crypto.createHash('md5').update('destroytest').digest('hex');
        var filename = this.store.prefix + hashedID;
        var value = {message:"hello", target:"world", lastAccess:+new Date()};
        
        fs.writeFileSync( path.join(testPath,filename), JSON.stringify(value) );
        
        this.store.destroy('destroytest', function(err, data){
            // check the file was created
            test.ok( !path.existsSync(path.join( testPath, filename)));
            test.done();
        });  
    },
    
    
    testAllEmpty: function(test){
        var store = this.store;
        var dummyFilePath = path.join(this.testPath, 'message.txt');
        fs.writeFileSync( dummyFilePath, 'hello world' );
        
        store.all(function(err,result){
            test.deepEqual( [], result );
            test.done();
        });
    },
    
    testAll: function(test){
        var store = this.store;
        // NOTE AV : the order won't be the same, since the filenames are hashes
        var expected = [{name:'all2'},{name:'all1'},{name:'all3'}];
        
        Step(
            function set1(){
                store.set('all1', {name:'all1'}, this);
            },
            function set2(){
                store.set('all2', {name:'all2'}, this );
            },
            function set3(){
                store.set('all3', {name:'all3'}, this );
            },
            function all(){
                store.all(this);
            },
            function results(err, result){
                test.deepEqual( expected, result );
                test.done();
            }
        );
    },
    
    
    testLength: function(test){
        var store = this.store;
        
        Step(
            function set1(){
                store.set('all1', {name:'all1'}, this);
            },
            function set2(){
                store.set('all2', {name:'all2'}, this );
            },
            function length(){
                store.length(this);
            },
            function results(err, result){
                test.equal( 2, result );
                test.done();
            }
        );
    },
    
    
    testClear: function(test){
        var self = this;
        // create a dummy file
        var dummyFilePath = path.join(this.testPath, 'message.txt');
        fs.writeFileSync( dummyFilePath, 'hello world' );
        
        Step(
            function set1(){
                self.store.set('all1', {name:'all1'}, this);
            },
            function set2(){
                self.store.set('all2', {name:'all2'}, this );
            },
            function clear(){
                self.store.clear(this);
            },
            function length(){
                self.store.length(this);
            },
            function results(err, result){
                test.equal( 0, result );
                test.ok( path.existsSync( dummyFilePath ) );  
                // test.equal( 'hello world', fs.readFileSync( path.join( self.testPath, 'message.txt' ) ) );
                // log( path.join( self.testPath, 'message.txt' ) + ' / ' + fs.readFileSync( path.join( self.testPath, 'message.txt' )) );
                test.done();
            }
        );
    }
    
});
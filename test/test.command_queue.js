var Common = require( '../src/common.js' );
log( Common.path.join(Common.paths.src,'command_queue') );
var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

describe('Command Queue', function(){

    beforeEach( function(){
        this.queue = CommandQueue.create();
    });

    describe('create', function(){
        it('should create', function(){
            
        });
    });

    describe('process', function(){
        it('should execute a command', function(done){
            var cmd = new Backbone.Model();

            cmd.execute = function(){
                done();
            };

            this.queue.add( cmd );
            assert.equal( q.length, 1 );
            this.queue.process();
        });

        it('should run the callback', function(done){
            var processed = false;
            var cmd = new Backbone.Model();
            cmd.execute = function(){
                processed = true;
            };

            this.queue.add( cmd );
            assert.equal( q.length, 1 );
            this.queue.process(function(){
                assert( processed );
                assert.equal( q.length, 0 );
                done();
            });
        });

    });
});
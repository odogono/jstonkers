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
        it('should process multiple commands', function(done){
            var self = this, processCount = 0;
            var Cmd = Backbone.Model.extend({
                execute: function(){
                    processCount++;
                }
            });
            this.queue.add( new Cmd() );
            this.queue.add( new Cmd() );
            this.queue.add( new Cmd() );

            assert.equal( this.queue.length, 3 );
            this.queue.process(function(){
                assert.equal( processCount, 3 );
                assert.equal( self.queue.length, 0 );
                done();
            }); 
        });

        it('should run the callback', function(done){
            var self = this, processed = false;
            var cmd = new Backbone.Model();
            cmd.execute = function(){
                processed = true;
            };

            this.queue.add( cmd );
            assert.equal( this.queue.length, 1 );
            this.queue.process(function(){
                assert( processed );
                assert.equal( self.queue.length, 0 );
                done();
            });
        });

        it('should process multiple commands', function(done){
            var self = this, processCount = 0;
            var Cmd = Backbone.Model.extend({
                execute: function(){
                    processCount++;
                }
            });
            // override the time function to return a specific time
            this.queue.time = function(){
                return 50;
            }

            this.queue.add( new Cmd({execute_time:0}) );
            this.queue.add( new Cmd({execute_time:100}) );
            this.queue.add( new Cmd({execute_time:200}) );
            
            assert.equal( this.queue.length, 3 );
            this.queue.process(function(){
                assert.equal( processCount, 1 );
                assert.equal( self.queue.length, 2 );
                done();
            });

        });   

    });
});
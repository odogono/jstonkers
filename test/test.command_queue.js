var Common = require( '../src/common.js' );
var CommandQueue = require( Common.path.join(Common.paths.src,'command_queue') );

var CmdTestA = CommandQueue.Command.extend({
    execute: function(options,callback){
        return true;
    },
    isCmdTestA: function(){
        return true;
    }
});

Common.entity.registerEntity( 'cmd_test_a', CmdTestA );

Common.entity.registerEntity({
    type: 'test_container', ER:[ { type:'cmd_queue'} ]
});
// print_ins( Common.entity.TestContainer );
// process.exit();

describe('Command Queue', function(){

    beforeEach( function(done){
        this.queue = CommandQueue.create();
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    /*
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
    });//*/

    describe('persistence', function(){
        /*it('should', function(done){
            var self = this;
            var a = Common.entity.create( CmdTestA, {execute_time:101} );
            var b = Common.entity.create( CmdTestA, {execute_time:201} );

            this.queue.add( a );
            this.queue.add( b );
            // print_var( self.queue.flatten({toJSON:true}) );

            Step(
                function(){
                    self.queue.saveCB(this);
                },
                function(err,result){
                    if( err ) throw( err );
                    // log('saved');
                    // print_ins( self.queue );
                    // print_var( self.queue.flatten({toJSON:true}) );
                    // print_ins( a );
                    done();
                }
            );
        });//*/


        it('should add commands correctly', function(){
            // var a = Common.entity.create( CmdTestA, {execute_time:201} );
            this.queue.add( { id:'cmd_001', type:'cmd_test_a', execute_time:201 } );
            // print_ins( this.queue.at(0) );

            assert( this.queue.at(0).isCmdTestA() );
        });

        
        it('should persist as part of a parent entity', function(done){
            var self = this;

            var container = Common.entity.create( Common.entity.TYPE_TEST_CONTAINER, {name:'game', colour:'red'} );

            assert.equal( container.type, Common.entity.TYPE_TEST_CONTAINER );
            assert.equal( container.cmd_queue.type, Common.entity.TYPE_CMD_QUEUE );

            var a = Common.entity.create( CmdTestA, {execute_time:201} );
            var b = Common.entity.create( CmdTestA, {execute_time:101} );

            container.cmd_queue.add( a );
            container.cmd_queue.add( b );
            
            Step(
                function(){
                    container.saveCB(this);
                },
                function(err,result){
                    if( err ) throw( err );
                    var flat = result.flatten({toJSON:true});
                    assert.equal( flat['2'].type, 'cmd_queue' );
                    var newContainer = Common.entity.create( Common.entity.TYPE_TEST_CONTAINER, {id:result.id} );
                    newContainer.fetchRelatedCB( this );
                },
                function(err,result){
                    if( err ) throw err;
                    var flat = result.flatten({toJSON:true});
                    assert.equal( flat['2'].type, 'cmd_queue' );
                    // print_var( flat );
                    assert( result.cmd_queue.at(0).isCmdTestA() );
                    done();
                }
            );
        });//*/
    });

});
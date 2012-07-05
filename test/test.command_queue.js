var Common = require( '../src/common.js' );
var MainServer = require( '../src/main.server' );
var CommandQueue = require('../src/command_queue');

var CmdTestA = CommandQueue.Command.extend({
    execute: function(options,callback){
        callback( null, true, this );
    },
    isCmdTestA: function(){
        return true;
    }
});

Common.entity.registerEntity( 'cmd_test_a', CmdTestA );

Common.entity.registerEntity({
    type: 'test_container', ER:[ { type:'cmd_queue'} ]
});

describe('Command Queue', function(){

    beforeEach( function(done){
        this.queue = CommandQueue.create();
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    
    describe('create', function(){
        it('should create', function(){
            
        });

        
        it('should add commands correctly', function(){
            // var a = Common.entity.create( CmdTestA, {execute_time:201} );
            this.queue.add( { id:'cmd_001', type:'cmd_test_a', execute_time:201 } );
            // print_ins( this.queue.at(0) );

            assert( this.queue.at(0).isCmdTestA() );
        });
    });//*/

    
    describe('process', function(){
        
        it('should process multiple commands', function(done){
            var self = this, processCount = 0;
            var Cmd = CommandQueue.Command.extend({
                execute: function(options,callback){
                    processCount++;
                    callback();
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
            var cmd = new CommandQueue.Command();
            cmd.execute = function(options,callback){
                processed = true;
                callback();
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
            var Cmd = CommandQueue.Command.extend({
                execute: function(options,callback){
                    processCount++;
                    callback();
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

        it('should order added commands', function(){
            this.queue.add( { id:'cmd_001', type:'cmd_test_a', execute_time:201 } );
            this.queue.add( { id:'cmd_002', type:'cmd_test_a', execute_time:0 } );
            this.queue.add( { id:'cmd_003', type:'cmd_test_a', execute_time:20 } );
            this.queue.add( { id:'cmd_004', type:'cmd_test_a', execute_time:-1 } );

            assert.equal( this.queue.at(0).id, 'cmd_004' );
            assert.equal( this.queue.at(1).id, 'cmd_002' );
            assert.equal( this.queue.at(2).id, 'cmd_003' );
            assert.equal( this.queue.at(3).id, 'cmd_001' );
        });

        it('should cope with re-occuring commands', function(done){
            var Cmd = CommandQueue.Command.extend({
                execute: function(options,callback){
                    this.isFinished = false;
                    callback();
                }
            });

            this.queue.add( new Cmd({execute_time:0}) );
            this.queue.process( function(err, executeCount, finishedCount){
                assert.equal( executeCount, 1 );
                assert.equal( finishedCount, 0 );
                done();
            });
        });

    });//*/


    describe('serialisation', function(){

        it('should persist to JSON', function(){

            this.queue.set('id', 'cq_000');
            this.queue.add( [{ id:'cmd_001', type:'cmd_test_a', execute_time:201 },
                            { id:'cmd_002', type:'cmd_test_a', execute_time:0 },
                            { id:'cmd_003', type:'cmd_test_a', execute_time:20 },
                            { id:'cmd_004', type:'cmd_test_a', execute_time:-1 }] );

            var expected = {
                "id": "cq_000",
                "type":"cmd_queue",
                "items": [
                    {
                        "id": "cmd_004",
                        "type": "cmd_test_a",
                        "execute_time": -1
                    },
                    {
                        "id": "cmd_002",
                        "type": "cmd_test_a",
                        "execute_time": 0
                    },
                    {
                        "id": "cmd_003",
                        "type": "cmd_test_a",
                        "execute_time": 20
                    },
                    {
                        "id": "cmd_001",
                        "type": "cmd_test_a",
                        "execute_time": 201
                    }
                ]
            };
            
            // print_ins( this.queue.toJSON({noDates:true}) );
            // print_var( this.queue.attributes );
            assert.deepEqual( this.queue.toJSON({noDates:true}), expected );
            
        });
        
        it('should reference items', function(){
            this.queue.set('id', 'cq_000');
            this.queue.add( [{ id:'cmd_001', type:'cmd_test_a', execute_time:201 },
                            { id:'cmd_002', type:'cmd_test_a', execute_time:0 },
                            { id:'cmd_003', type:'cmd_test_a', execute_time:20 },
                            { id:'cmd_004', type:'cmd_test_a', execute_time:-1 }] );

            var expected = {
                "id": "cq_000",
                "type":"cmd_queue",
                "items": [
                    "cmd_004",
                    "cmd_002",
                    "cmd_003",
                    "cmd_001"
                ]
            };
            assert.deepEqual( this.queue.toJSON({referenceItems:true,noDates:true}), expected );
        });

        it('should flatten to JSON', function(){
            this.queue.set('id', 'cq_000');
            this.queue.add( [{ id:'cmd_001', type:'cmd_test_a', execute_time:201 },
                            { id:'cmd_002', type:'cmd_test_a', execute_time:0 },
                            { id:'cmd_003', type:'cmd_test_a', execute_time:20 },
                            { id:'cmd_004', type:'cmd_test_a', execute_time:-1 }] );

            var expected = {
                "cq_000": {
                    "id": "cq_000",
                    "items": [ "cmd_004", "cmd_002", "cmd_003", "cmd_001" ],
                    "type": "cmd_queue"
                },
                "cmd_004": {
                    "id": "cmd_004",
                    "type": "cmd_test_a",
                    "execute_time": -1
                },
                "cmd_002": {
                    "id": "cmd_002",
                    "type": "cmd_test_a",
                    "execute_time": 0
                },
                "cmd_003": {
                    "id": "cmd_003",
                    "type": "cmd_test_a",
                    "execute_time": 20
                },
                "cmd_001": {
                    "id": "cmd_001",
                    "type": "cmd_test_a",
                    "execute_time": 201
                }
            };

            // print_ins( this.queue.flatten({toJSON:true}) );
            assert.deepEqual( this.queue.flatten({toJSON:true,referenceItems:true,noDates:true}), expected );
        });

        it('should set from a JSON form', function(){
            var ser = {
                "id":"test.001",
                "type":"test_container",
                "cmd_queue":[
                    { "id":"cmd.001", "type": "cmd_test_a", "execute_time":10 },
                    { "id":"cmd.002", "type": "cmd_test_a", "execute_time":11 },
                ]
            };

            var a = Common.entity.create( ser );

            // var data = a.parse(ser,null,{parseFor:'test.001',removeId:false,debug:true});
            // print_var( data );

            assert.equal( a.cmd_queue.at(0).get('execute_time'), 10 );
            assert.equal( a.cmd_queue.at(1).get('execute_time'), 11 );
        });

        it('should parse from a serialised form', function(){
            var ser = {
                "test.001":{
                    "cmd_queue":[ {"type":"cmd_test_a", "execute_time":10} ]
                }
            };
            var a = Common.entity.create( {type:'test_container', id:'test.001'} );
            var data = a.parse(ser,null,{parseFor:'test.001'});
            a.set( data );

            assert.equal( a.cmd_queue.at(0).get('execute_time'), 10 ); 
        });

        it('should serialise without relations', function(){
            this.queue.set({
                "id":"test.001",
                "items":[
                    { "id":"cmd.001", "type": "cmd_test_a", "execute_time":10 },
                    { "id":"cmd.002", "type": "cmd_test_a", "execute_time":11 },
                ]
            });

            assert.deepEqual( this.queue.toJSON({relations:false}), { "type":"cmd_queue", "id":"test.001"});
        });//*/
    });


    describe('persistence', function(){
        
        it('should add and remove commands', function(done){
            var self = this;
            var cmd;

            // this.queue.set('auto_save',true);
            Step(
                function saveQueueFirst(){
                    self.queue.saveCB( this );
                },
                function createCommandAndAdd(err,result){
                    cmd = Common.entity.create( CmdTestA, {execute_time:-1} );
                    self.queue.add( cmd );
                    assert.equal( self.queue.length, 1 );
                    self.queue.saveCB( this );
                },
                function destroyCommand(err,result){
                    if( err ) throw err;
                    cmd.destroyCB({destroyHard:true},this);
                },
                function retrieveQueue(err,result){
                    if( err ) throw err;
                    var q = CommandQueue.create({id:self.queue.id});
                    q.fetchRelatedCB(this);
                },
                function(err,result){
                    if( err ) throw err;
                    assert.equal( result.items.length, 0)
                    done();
                }
            );
        });

        it('should indicate when missing', function(done){
            var self = this;
            Step(
                function retrieveQueue(){
                    var q = CommandQueue.create({id:'missing.001'});
                    q.fetchRelatedCB(this);
                },
                function(err,result){
                    assert.equal( err, 'missing.001 not found' );
                    done();
                }
            );
        });

        it('should destroy processed commands', function(done){
            var self = this;
            Step(
                function saveQueueFirst(){
                    self.queue.saveCB( this );
                },
                function createCommandAndAdd(err,result){
                    if( err ) throw err;
                    var cmd = Common.entity.create( CmdTestA, {execute_time:-1} );
                    self.queue.add( cmd );
                    assert.equal( self.queue.length, 1 );
                    self.queue.saveCB( this );
                },
                function processQueue(err,result){
                    if( err ) throw err;
                    self.queue.process( this );
                },
                function recreateQueue(err,result){
                    if( err ) throw err;
                    assert.equal( self.queue.length, 0)
                    var q = CommandQueue.create({id:self.queue.id});
                    // the fetched queue should contain no items
                    q.fetchRelatedCB(this);
                },
                function(err,result){
                    if( err ) throw err;
                    // print_var( result.flatten() );
                    assert.equal( result.length, 0)
                    done();
                }
            );

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
var Common = require( '../src/common.js' );

// function handleBJSResult( next, options ){
//     options || (options={});
//     return _.extend(options,{
//         success:function(model,resp){
//             next(null, model, resp);
//         },
//         error:function(err,model,resp){
//             next( err, model, resp);
//         }
//     });
// }

describe('Sync.Redis', function(){

    Common.sync.set('override','redis');

    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });

        var testEntity = {
            name: 'test',
            type: 'test',
        }
        Common.entity.registerEntity( testEntity );
    });

    
    describe('id generation', function(){
        var id1, id2;
        it('should create a new id', function(done){
            Step(
                function(){
                    Common.sync.generateUuid(this);
                },
                function(err,id){
                    if(err) throw err;
                    id1 = id;
                    Common.sync.generateUuid(this);
                },
                function(err,id){
                    if(err) throw err;
                    id.should.not.equal(id1);
                    done();
                }
            );
        });
    });

    
    describe('Entity', function(){
        
        it('should make the entity belong to a status set');

        it('should delete the entity cleanly');

        it('should save an entity', function(done){
            Step(
                function(){
                    var user = Common.entity.create(Common.entity.TYPE_USER, {name:'freddy'}); 
                    user.save( null, Bjs2Callback(this) );
                },
                function(err,user){
                    if( err ) throw err;
                    user.get('name').should.equal('freddy');
                    var restoredUser = Common.entity.create( user.id );
                    restoredUser.fetch( Bjs2Callback(this) );
                },
                function(err,restoredUser){
                    if( err ) throw err;
                    restoredUser.get('name').should.equal('freddy');
                    done();
                }
            )
        });
    });

    
    
    /*

    describe('EntityCollection', function(){
        
        it('should save contained entities', function(done){
            var entityIds = [];

            Step(
                function(){
                    var col = Common.entity.createEntityCollection();
                    for( var i=0;i<3;i++ ){
                        col.add( Common.entity.create( {id:'test.00'+(i+1), name:'test entity ' + i} ) );    
                    }
                    col.at(2).set('created_at', '1974-09-05T15:32Z');
                    col.length.should.equal(3);
                    col.get('item_count').should.equal(3);

                    entityIds = col.items.map( function(i){ return i.id; });

                    col.save( null, {success:this});
                },
                function(col){
                    var group = this.group();

                    // verify the entites were saved
                    _.each( entityIds, function(eid){
                        var entity = Common.entity.create( eid );
                        entity.fetch( Bjs2Callback(group()) );
                    });
                },
                function(err,entities){
                    entities[1].get('name').should.equal('test entity 1');
                    entities[2].get('created_at').should.equal('1974-09-05T15:32:00.000Z');
                    done();
                }
            );
        });

        
        
        it('should work as part of an entity', function(done){
            var entityDef = {
                type: 'ecenta',
                ER:[
                    { oneToMany: 'ecentb', name:'friends' }
                ]
            };
            Common.entity.registerEntity( { type: 'ecentb' } );
            Common.entity.registerEntity( entityDef );

            var inst = Common.entity.create( 'ecenta.001' );
            inst.friends.add( Common.entity.create({id:'002', type:'ecentb', name:'friend A'}) );

            var friend = inst.friends.at(0);
            friend.should.be.an.instanceof( Common.entity.Ecentb.entity );
            inst.friends.length.should.equal(1);
            inst.friends.get('item_count').should.equal(1);

            Step(
                function(){
                    inst.save( null, Bjs2Callback(this) );
                },
                function(err, model, resp){
                    // print_ins(arguments);
                    var restored = new Common.entity.create( inst.id );
                    restored.friends.length.should.equal(0);
                    restored.friends.get('item_count').should.equal(0);
                    restored.fetch( Bjs2Callback(this) );
                },
                function(err, result, resp){
                    result.friends.length.should.equal(0);
                    result.friends.get('item_count').should.equal(1);
                    done();
                }
            );
        });

        
        it('should retrieve an entities children', function(done){
            var entityDef = {
                type: 'sraeca',
                ER:[
                    { oneToMany: 'sraecb', name:'chums' }
                ]
            };
            Common.entity.registerEntity( { type: 'sraecb' } );
            Common.entity.registerEntity( entityDef );

            var inst = Common.entity.create( 'sraeca.001' );
            inst.chums.add( Common.entity.create({id:'002', type:'sraecb', name:'Good chum no.1'}) );

            var other = Common.entity.create({id:'sraecb:OUTSIDER', type:'sraecb', name:'should not return'});

            Step(
                function(){
                    // save the other entity which isn't part of the entities collection
                    other.save(null, Bjs2Callback(this) );
                },
                function(){
                    inst.save( null, Bjs2Callback(this) );
                }, 
                function(err, model, resp){
                    var restored = new Common.entity.create( inst.id );
                    restored.fetch( Bjs2Callback(this, {retrieveChums:true} ) );
                },
                function(err, result, resp){
                    result.chums.length.should.equal(1);
                    result.chums.get('item_count').should.equal(1);
                    result.chums.at(0).get('name').should.equal( 'Good chum no.1' );
                    done();
                }
            );
        });

        it('should retrieve an entities children directly', function(done){
            var entityDef = {
                type: 'sraeca',
                ER:[
                    { oneToMany: 'sraecb', name:'chums' }
                ]
            };
            Common.entity.registerEntity( { type: 'sraecb' } );
            Common.entity.registerEntity( entityDef );

            var inst = Common.entity.create( 'sraeca.001' );
            inst.chums.add( Common.entity.create({id:'002', type:'sraecb', name:'Good chum no.1'}) );

            // create another entity just to be sure
            var other = Common.entity.create({id:'sraecb:OUTSIDER', type:'sraecb', name:'should not return'});

            var restored = null;

            Step(
                function(){
                    // save the other entity which isn't part of the entities collection
                    other.save(null, Bjs2Callback(this) );
                },
                function(){
                    inst.save( null, Bjs2Callback(this) );
                }, 
                function(err, model, resp){
                    restored = new Common.entity.create( inst.id );
                    restored.chums.length.should.equal(0);
                    restored.chums.get('item_count').should.equal(0);

                    // this is the difference - we are asking the collection directly to get its members
                    restored.chums.fetch( Bjs2Callback(this) );
                },
                function(err, result, resp){
                    restored.chums.length.should.equal(1);
                    restored.chums.get('item_count').should.equal(1);

                    // print_var( restored.chums.at(0) );
                    restored.chums.at(0).get('name').should.equal( 'Good chum no.1' );
                    done();
                }
            );
        });

        
        it('should be able to query entities', function(done){
            
            var entityDefA = { type:'qenta' };
            // var entityDefB = { type:'qentb' };
            Common.entity.registerEntity( entityDefA );
            // Common.entity.registerEntity( entityDefB );

            var col, i, entities;

            Step(
                function(){
                    var ent = Common.entity.create( {id:'qenta.A001', name:'totally special QuentA'} );
                    ent.save(null,{error:this, success:this});
                },
                function(){
                    entities = [];
                    for( i=0;i<5;i++ )
                        entities.push( {id:_.sprintf('qenta.%03d', i+1), name:'test entity ' + (i+1)} );
                    entities = _.shuffle( entities );
                    col = Common.entity.createEntityCollection( {items:entities, entity:entityDefA} );
                    col.length.should.equal(5);
                    col.get('item_count').should.equal(5);
                    col.at(0).should.be.an.instanceof( Common.entity.Qenta.entity );
                    col.save(null, {error:this, success:this});
                },
                function fetchAllEntityA(){
                    col = Common.entity.createEntityCollection({entity:entityDefA});
                    col.fetch({error:this,success:this});
                },
                function(result){
                    result.length.should.equal(6);
                    result.get('item_count').should.equal(6);
                    done();
                }
            )
        });

        it('should retrieve a subset of entities', function(done){
            var entityDefA = { type:'qenta' };
            Common.entity.registerEntity( entityDefA );

            var col, i, entities = [];

            for( i=0;i<15;i++ )
                entities.push( {id:_.sprintf('qenta.%03d', i+101), name:'test entity ' + (i+101)} );
            entities = _.shuffle( entities );

            Step(
                function(){
                    col = Common.entity.createEntityCollection( {items:entities, entity:entityDefA} );
                    col.length.should.equal(15);
                    col.at(0).should.be.an.instanceof( Common.entity.Qenta.entity );
                    col.save(null, Bjs2Callback(this) );
                },
                function fetchAllEntityA(err,result){
                    col = Common.entity.createEntityCollection({entity:entityDefA});
                    col.fetch( Bjs2Callback(this) );
                },
                function(err, result){
                    result.length.should.equal(10);
                    result.get('item_count').should.equal(15);
                    done();  
                }
            );
        });
        
        
        it('should retrieve a specified entity', function(done){
            var retrieveId;

            Step(
                function(){
                    var col = Common.entity.createEntityCollection({entity:Common.entity.TYPE_TEST});
                    for( var i=0;i<5;i++ )
                        col.add( Common.entity.create( Common.entity.TYPE_TEST, {name:'test entity ' + i, status:Common.Status.INACTIVE} ) );
                    retrieveId = col.at(2).id;
                    col.save( null, {success:this});
                },
                function fetchAllEntityA(){
                    var next = this;
                    var col = Common.entity.createEntityCollection({entity:Common.entity.TYPE_TEST});
                    // col.fetch({error:this,success:this, find:{id:retrieveId} });

                    col.fetch({find:{id:retrieveId},
                        success:function(model,resp){
                        // print_ins( arguments );
                        next( null, model );
                    }, error:function(err,model,resp){
                        next( err, model );
                    }});
                },
                function(err,result){
                    // print_ins(arguments);
                    result.length.should.equal(1);
                    result.get('item_count').should.equal(1);
                    result.at(0).id.should.equal( retrieveId );
                    done(); 
                }
            );
        });


        it('should retrieve entities with a given status', function(done){
            var entityIds = [];

            Step(
                function(){
                    var col = Common.entity.createEntityCollection({entity:Common.entity.TYPE_TEST});
                    for( var i=0;i<5;i++ )
                        col.add( Common.entity.create( Common.entity.TYPE_TEST, {name:'test entity ' + i, status:Common.Status.INACTIVE} ) );

                    col.at(1).set('status', Common.Status.ACTIVE );
                    col.at(3).set('status', Common.Status.ACTIVE );
                    
                    entityIds = col.items.map( function(i){ return i.id; });
                    col.save( null, {success:this});
                },
                function fetchAllEntityA(){
                    var next = this;
                    var col = Common.entity.createEntityCollection({entity:Common.entity.TYPE_TEST});
                    col.fetch({find:{status:{$ne:Common.Status.INACTIVE}},
                        success:function(model,resp){
                        // print_ins( arguments );
                        next( null, model );
                    }, error:function(err,model,resp){
                        next( err, model );
                    }});
                },
                function(err,result){
                    result.length.should.equal(2);
                    result.get('item_count').should.equal(2);
                    done(); 
                }
            );
        });
    });//*/
    


});
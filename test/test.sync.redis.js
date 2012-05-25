var Common = require( '../src/common.js' );

describe('Sync.Redis', function(){

    var testEntities = [
        { type: 'test_a', ER:[ { oneToMany: 'test_b' } ] },
        { type: 'test_b', ER:[ { oneToMany:'test_c'} ] },
        { type: 'test_c' },
        { type: 'test_d', ER:[ { oneToOne:'test_c', name:'friend'},{ oneToOne:'test_c', name:'colleague'} ] },
        { type: 'test_e', ER:[ {oneToOne:'test_f', name:'comrade'} ] },
        { type: 'test_f' },
    ];

    _.each( testEntities.reverse(), function(e){
        Common.entity.registerEntity(e);
    });


    Common.sync.set('override','redis');

    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    /*
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
    });//*/

    describe('Entity', function(){
        
        // it('should make the entity belong to a status set');

        // it('should delete the entity cleanly');
        
        it('should save an entity', function(done){
            Step(
                function(){
                    var user = Common.entity.create(Common.entity.TYPE_TEST_A, {name:'freddy'}); 
                    user.saveCB( null, this );
                },
                function(err,user){
                    if( err ) throw err;
                    user.get('name').should.equal('freddy');
                    var restoredUser = Common.entity.create( Common.entity.TYPE_TEST_A, user.id );
                    restoredUser.fetchCB( this );
                },
                function(err,restoredUser){
                    if( err ) throw err;
                    restoredUser.get('name').should.equal('freddy');
                    done();
                }
            )
        });

        it('should save part of a o2o relationship', function(done){
            var a = Common.entity.create( Common.entity.TYPE_TEST_E, {name:'enigma'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_F, {name:'foxtrot'} );
            a.set( {comrade:b} );

            Step(
                function(){
                    a.saveCB( null, this );
                },
                function(err,result){
                    Common.entity.create( Common.entity.TYPE_TEST_E, a.id ).fetchCB( this );
                },
                function(err,model,resp){
                    assert.equal( model.id, a.id );
                    assert.equal( model.get('name'), a.get('name') );
                    assert( !model.get('comrade') );
                    done();
                }
            );
        });

        
        it('should save a complete o2o relationship', function(done){
            var a = Common.entity.create( Common.entity.TYPE_TEST_E, {name:'enigma'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_F, {name:'foxtrot'} );

            // print_ins(a);
            a.set( {comrade:b} );

            Step(
                function(){
                    assert( a.isNew() );
                    assert( b.isNew() );
                    a.saveRelatedCB( null, this );
                },
                function(err,result){
                    assert( !a.isNew() );
                    assert( !b.isNew() );
                    var aC = Common.entity.create( Common.entity.TYPE_TEST_E, a.id );
                    aC.fetchRelatedCB( this );
                },
                function(err,model,resp){
                    assert.equal( model.get('comrade').get('name'), 'foxtrot' );
                    done();
                }
            );
        });
        
        
        it('should save a parent and child entity', function(done){
            var a = Common.entity.create( Common.entity.TYPE_TEST_A, {name:'alex'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_B, {name:'beatrix'} );
            
            a.test_b.add( b );
            assert( a.test_b.length, 1 );
            assert( a.test_b instanceof Common.entity.EntityCollection );
            // print_ins( a );
            Step(
                function (){
                    assert( a.isNew() );
                    assert( b.isNew() );
                    a.saveRelatedCB( null, this );
                },
                function(err,result){
                    assert( !a.isNew() );
                    assert( !b.isNew() );
                    // should still have the same objects essentially
                    assert( result.test_b.length, 1 );
                    // attempt restore
                    var aCopy = Common.entity.create( Common.entity.TYPE_TEST_A, a.id );
                    assert.equal( aCopy.id, a.id );
                    assert( aCopy instanceof Common.entity.Entity );
                    // fetch the parent and children to a depth of two
                    aCopy.fetchRelatedCB( {debug:true}, this );
                },
                function(err,result){
                    if( err ) throw err;
                    assert.equal( result.get('name'), 'alex');
                    assert( result.test_b instanceof Common.entity.EntityCollection );
                    assert.equal( result.test_b.length, 1 );
                    assert.equal( result.test_b.at(0).get('name'), 'beatrix' );
                    done();
                }
            );

        });

        
        it('should retrieve an associated entity', function(done){
            var a = Common.entity.create( Common.entity.TYPE_TEST_D, {name:'alpha'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_C, {name:'beta'} );
            a.set('friend',b);
            a.set('colleague',b);
            Step(
                function(){
                    a.saveRelatedCB( null, this ); 
                },
                function(err,result){
                    var copy = Common.entity.create( Common.entity.TYPE_TEST_D, result.id );
                    copy.fetchRelatedCB( this );
                },
                function(err,result){
                    assert( result.get('name') === a.get('name') );
                    assert( result.get('friend').get('name') === b.get('name') );
                    done();
                }
            );
        });

        it('should respond correctly to fetching a nonexistent entity', function(done){
            Step(
                function(){
                    Common.entity.create( Common.entity.TYPE_TEST_A, 'unknown.001' ).fetchCB( this );
                },
                function(err, result){
                    assert.equal( err, 'unknown.001 not found');
                    done();
                }
            );
        });

        
        it('should logically delete an entity', function(done){
            var a = Common.entity.create( Common.entity.TYPE_TEST_A, {name:'alf',status:Common.Status.ACTIVE} );
            assert.equal( a.get('status'), Common.Status.ACTIVE );
            
            Step(
                function(){
                    a.saveCB( null, this);
                },
                function(err,result){
                    Common.entity.create( Common.entity.TYPE_TEST_A, a.id ).fetchCB( this );
                },
                function(err,result){
                    assert.equal(result.get('name'), 'alf');
                    assert.equal(result.get('status'),Common.Status.ACTIVE);
                    // log('destroying here');
                    result.destroyCB(this);
                },
                function(err,result){
                    assert( !err );
                    Common.entity.create( Common.entity.TYPE_TEST_A, a.id ).fetchCB( this );
                },
                function(err,result){
                    assert.equal(err, a.id + ' not found');
                    Common.entity.create( Common.entity.TYPE_TEST_A, a.id ).fetchCB( {ignoreStatus:true}, this );
                },
                function(err, finalResult ){
                    if( err ) throw err;
                    assert( finalResult.get('name'), 'alf' );
                    assert( finalResult.get('status'), Common.Status.LOGICALLY_DELETED );
                    done();
                }
            );
        });


        it('should completely delete an entity', function(done){
            var a = Common.entity.create( {type:Common.entity.TYPE_TEST_A, name:'ash', status:Common.Status.ACTIVE} );
            var initialCount;
            var initialKeys;
            Step(
                function(){
                    Common.sync.keys( this );
                },
                function(err, result){
                    initialKeys = result;
                    initialCount = result.length;
                    a.saveCB( null, this );
                },
                function(err,result){
                    result.destroyCB({destroyHard:true},this);
                },
                function(){
                    Common.entity.create( Common.entity.TYPE_TEST_A, a.id ).fetchCB( {ignoreStatus:true}, this );
                },
                function(err,result){
                    assert.equal(err, a.id + ' not found');
                    Common.sync.keys( this );
                },
                function(err, keys){
                    var config = Common.config.sync.redis;
                    var key = config.key_prefix + ':' + config.uuid.key;

                    // the only difference should be the uuid key
                    assert.equal(key, _.difference( keys, initialKeys )[0] );
                    // same count minus the uuid key
                    assert.equal( initialCount, keys.length-1 );
                    done();
                }
            );
        });

        it('should logically delete an entity and related');

        it('should completely delete an entity and related');        
    });//*/

    
    
    
    /*
    describe('EntityCollection', function(){
        
        it('should save contained entities', function(done){
            var entityIds = [];

            Step(
                function(){
                    var col = Common.entity.createEntityCollection();
                    for( var i=0;i<3;i++ ){
                        col.add( Common.entity.create( {id:'test.00'+(i+1), type:'test_a', name:'test entity ' + i} ) );    
                    }
                    col.at(2).set('created_at', '1974-09-05T15:32Z');
                    col.length.should.equal(3);
                    col.get('item_count').should.equal(3);
                    entityIds = col.items.map( function(i){ return i.id; });

                    col.saveCB( this );
                },
                function(col){
                    var group = this.group();

                    // verify the entites were saved
                    _.each( entityIds, function(eid){
                        var entity = Common.entity.create( 'test_a', eid );
                        entity.fetchCB( group() );
                    });
                },
                function(err,entities){
                    assert.equal( entities[1].get('name'), 'test entity 1');
                    assert.equal( new Date(entities[2].get('created_at')).toUTCString(), new Date('1974-09-05T15:32:00.000Z').toUTCString() );
                    done();
                }
            );
        });

        
        /*
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
                        col.add( Common.entity.create( Common.entity.TYPE_TEST_A, {name:'test entity ' + i, status:Common.Status.INACTIVE} ) );
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
                        col.add( Common.entity.create( Common.entity.TYPE_TEST_A, {name:'test entity ' + i, status:Common.Status.INACTIVE} ) );

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
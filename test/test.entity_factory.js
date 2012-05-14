var Common = require( '../src/common.js' );

describe('EntityFactory', function(){

    var testEntities = [
        { type: 'test_a', ER:[ { oneToMany: 'test_b', name:'kinder' } ] },
        { type: 'test_b', ER:[ { oneToMany:'test_c'} ] },
        { type: 'test_c' },
        { type: 'test_d', ER:[ { oneToOne:'test_c', name:'friend'} ] }
    ];

    _.each( testEntities.reverse(), function(e){
        Common.entity.registerEntity(e);
    });

    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });


    /*    
    describe('entity import', function(){

        
        // it('should import itself', function(){
        //     var data = JSON.parse('{'
        //         +'"a.001":{'
        //         +'    "name":"alpha"'
        //         +'}'
        //         +'}');

        //     var a = Common.entity.create( Common.entity.TYPE_TEST_A, 'a.001' );
        //     a.set(a.parse(data));
        //     assert.strictEqual( a.get('name'), 'alpha' );
        // });

        it('should import a o2o', function(){
            var data = JSON.parse('{'
                +'"d.001":{'
                +'    "name":"first",'
                +'    "friend":"c.002"'
                +'},'
                +'"c.002":{'
                +'    "name":"second"'
                +'}'
                +'}');

            var a = Common.entity.create( Common.entity.TYPE_TEST_D, 'd.001' );
            // print_ins(a.parse(data));
            // log( JSON.stringify(a.parse(data)));
            assert.equal( JSON.stringify(a.parse(data)), '{"name":"first","friend":{"name":"second"}}' )
        });

    });//*/

    describe('export', function(){
        
        it('should export an entity', function(){
            var entity = Common.entity.create(Common.entity.TYPE_TEST_A);
            var result = Common.entity.Factory.toJSON( entity, {referenceItems:true} );

            assert.equal( result[0].type, 'test_a' );
        });

        it('should export only the root entity', function(){
            var c = Common.entity.create( Common.entity.TYPE_TEST_C, {name:'charles'} );
            var d = Common.entity.create( Common.entity.TYPE_TEST_D, {name:'darren'} );
            d.set('friend', c);

            var result = Common.entity.Factory.toJSON( d );//, {toJSON:false,exportRelations:false} );
            assert.equal( result.length, 1 );
            assert.equal( result[0].name, 'darren' );
            assert( !result[0].friend );
        });

        it('should export only the root entity with a reference', function(){
            var c = Common.entity.create( Common.entity.TYPE_TEST_C, {name:'charles', id:'id_c'} );
            var d = Common.entity.create( Common.entity.TYPE_TEST_D, {name:'darren', id:'id_d'} );
            d.set('friend', c);

            var result = Common.entity.Factory.toJSON( d );
            // print_var( result );
            assert.equal( result.length, 1 );
            assert.equal( result[0].name, 'darren' );
            assert.equal( result[0].friend, 'id_c' );
        });

        
        it('should export a parent with children', function(){
            var parent, child;

            parent = Common.entity.create(Common.entity.TYPE_TEST_A);
            child = Common.entity.create(Common.entity.TYPE_TEST_B);
            var ochild = Common.entity.create(Common.entity.TYPE_TEST_B);
            parent.kinder.add( child );
            parent.kinder.add( ochild );

            var result = Common.entity.Factory.toJSON( parent, {debug:true, referenceItems:true, toJSON:true, exportRelations:true} );
            assert.deepEqual( result[0].kinder, [child.cid, ochild.cid] );
        });

        
        it('should export a map of entities in the tree', function(){
            var a = Common.entity.create( Common.entity.TYPE_TEST_A );
            var b = Common.entity.create( Common.entity.TYPE_TEST_B );
            var c = Common.entity.create( Common.entity.TYPE_TEST_C );

            a.kinder.add( b );
            b.test_c.add( c ); 
            var result = Common.entity.Factory.toJSON( a, {exportAsMap:true,exportRelations:true} );
            assert.equal( _.keys(result).length, 3 );
            // print_var( result );
        });

        
        it('should export a map of entities in the tree again', function(){
            var a = Common.entity.create( Common.entity.TYPE_TEST_A, {name:'alpha'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_B, {name:'beta'} );
            var c = Common.entity.create( Common.entity.TYPE_TEST_C, {name:'charles'} );

            a.kinder.add( b );
            a.set('other', c);
            b.set('other', c);
            c.set('other', a);

            // serialise the hierarchy into a map of cids to entities
            var result = Common.entity.Factory.toJSON( a, {toJSON:false,exportAsMap:true,exportRelations:true} );
            _.keys(result).length.should.equal(3);
            var values = _.values(result);
            // print_ins(values[0].cid);
            values[0].cid.should.equal( a.cid );
            values[1].cid.should.equal( b.cid );
            values[2].cid.should.equal( c.cid );

            // turn this into a json doc
            // var json = Common.entity.Factory.toJSON( result, {debug:true} );
            // print_var( json );
        });//*/

    });
    
    
    describe('EntityCollection', function(){
        it('should export an array of entities', function(){
            var entities = [];
            for( var i=0;i<5;i++ ){
                entities.push( new Common.entity.create( Common.entity.TYPE_TEST_A, {name:'entity ' + i}));
            }
            var json = Common.entity.toJSON( entities );
            // print_var( json );
            for( var i=0;i<5;i++ ){
                json.should.have.property( entities[i].cid );
            }
        });

        it('should export an array of entities as a list of ids', function(){
            var entities = [];
            for( var i=0;i<5;i++ ){
                entities.push( new Common.entity.create( Common.entity.TYPE_TEST_A, {name:'entity ' + i}));
            }

            var collection = Common.entity.createEntityCollection( {items:entities} );
            var result = collection.toJSON({collectionAsIdList:true});
            // print_var( result );
            for( var i=0;i<5;i++ ){
                assert.equal( result[i], entities[i].cid );
            }
        });
    });//*/
});
var Common = require( '../src/common.js' );
var MainServer = require( '../src/main.server' );
var EntityCollection = require('../src/entity/entity_collection');

describe('EntityCollection', function(){

    var testEntities = [
        { type: 'test_a', ER:[ { oneToMany: 'test_b' } ] },
        { type: 'test_b', ER:[ { oneToMany:'test_c'} ] },
        // { type: 'test_c' },
        // { type: 'test_d', ER:[ { oneToOne:'test_c', name:'friend'},{ oneToOne:'test_c', name:'colleague'} ] },
        { type: 'test_e', ER:[ {oneToOne:'test_f', name:'comrade'}, {oneToOne:'test_b', name:'friend'}, {oneToMany:'test_f', name:'others'} ] },
        { type: 'test_f', ER:[ {oneToOne:'test_a', name:'associate'} ] }
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
    
    
    it('should create from an array of entity data', function(){
        var i, entities = [];
        for( i=0;i<10;i++ )
            entities.push( {id:_.sprintf('test.%03d', i+1), name:'test entity ' + (i+1)} );

        var collection = EntityCollection.create( {items:entities, entity:'test_a'} );

        assert( collection.at(2) instanceof( Common.entity.TestA.entity ) );
        assert.equal( collection.at(1).type,  Common.entity.TestA.type );
        assert.equal( collection.at(3).get('name'), 'test entity 4' );
        assert.equal( collection.get('item_count'), 10);
    });

    it('should create from an array of entities', function(){
        var i,entities = [];
        for( i=0;i<10;i++ )
            entities.push( Common.entity.create( Common.entity.TYPE_TEST_A, {
                    id:_.sprintf('test.%03d', i+1),
                    name:'test entity ' + (i+1)}  ));

        var collection = EntityCollection.create( {items:entities} );
        assert( collection.at(2) instanceof Common.entity.TestA.entity );
        assert.equal( collection.at(1).type, Common.entity.TestA.type );
        assert.equal( collection.at(3).get('name'), 'test entity 4' );
        assert.equal( collection.get('item_count'), 10);
        assert.equal( collection.length, 10); 
    });

    it('should set from an array', function(){
        var incoming = [
            { id:'test.001', type:'test' },
            { id:'test.002', type:'test' }
        ];

        var collection = EntityCollection.create();
        collection.set( incoming );
        assert.equal( collection.length, 2 );
        assert.equal( collection.get('item_count'), 2 );
        assert.equal( collection.at(1).id, 'test.002' );
    });

    it('should set from an object', function(){
        var incoming = {
            item_count:200,
            items:[
                { id:'test.001', type:'test_a' },
                { id:'test.002', type:'test_a' }
            ]
        };

        var collection = EntityCollection.create();
        collection.set( incoming );
        assert.equal( collection.length, 2 );
        assert.equal( collection.get('item_count'), 200 );
        assert.equal( collection.at(1).id, 'test.002' );    
    });

    describe('flatten', function(){
        /*it('should produce a map', function(){
            var i,entities = [];
            for( i=0;i<10;i++ )
                entities.push( Common.entity.create({
                        id:_.sprintf('test.%03d', i+1),
                        type:'test_a',
                        name:'test entity ' + (i+1)}  ));
            var collection = Common.entity.createEntityCollection( {items:entities} );

            var result = collection.flatten();
            assert.equal( _.keys(result).length, 10 );
        });

        it('should produce a map', function(){
            var i,entities = [];
            for( i=0;i<10;i++ )
                entities.push( Common.entity.create({
                        id:_.sprintf('test.%03d', i+1),
                        type:'test_a',
                        name:'test entity ' + (i+1)}  ));
            var collection = Common.entity.createEntityCollection( {items:entities} );

            var result = collection.flatten();
            assert.equal( _.keys(result).length, 10 );
        });//*/

        it('should', function(){
            var i,entities = [];
            for( i=0;i<1;i++ )
                entities.push( Common.entity.create({
                        id:_.sprintf('test.%03d', i+1),
                        type:'test_a', name:'test entity ' + (i+1)}  ));

            var collection = EntityCollection.create( {id:'col.001', items:entities} );
            var result = collection.flatten({toJSON:true});
        });
    });
});
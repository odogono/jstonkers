var Common = require( '../src/common.js' );

describe('EntityCollection', function(){

    beforeEach( function(done){
        var testEntity = { name: 'test', type: 'test' };
        Common.entity.registerEntity( testEntity );

        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });
    
    
    it('should create from an array of entity data', function(){
        var i, entities = [];
        for( i=0;i<10;i++ )
            entities.push( {id:_.sprintf('test.%03d', i+1), name:'test entity ' + (i+1)} );

        var collection = Common.entity.createEntityCollection( {items:entities, entity:'test'} );


        assert( collection.at(2) instanceof( Common.entity.Test.entity ) );
        assert.equal( collection.at(1).type,  Common.entity.Test.type );
        assert.equal( collection.at(3).get('name'), 'test entity 4' );
        assert.equal( collection.get('item_count'), 10);
    });

    it('should create from an array of entities', function(){
        var i,entities = [];
        for( i=0;i<10;i++ )
            entities.push( Common.entity.create( Common.entity.TYPE_TEST, {
                    id:_.sprintf('test.%03d', i+1),
                    name:'test entity ' + (i+1)}  ));

        var collection = Common.entity.createEntityCollection( {items:entities} );
        assert( collection.at(2) instanceof Common.entity.Test.entity );
        assert.equal( collection.at(1).type, Common.entity.Test.type );
        assert.equal( collection.at(3).get('name'), 'test entity 4' );
        assert.equal( collection.get('item_count'), 10);
        assert.equal( collection.length, 10); 
    });

    it('should set from an array', function(){
        var incoming = [
            { id:'test.001', type:'test' },
            { id:'test.002', type:'test' }
        ];

        var collection = Common.entity.createEntityCollection();
        collection.set( incoming );
        assert.equal( collection.length, 2 );
        assert.equal( collection.get('item_count'), 2 );
        assert.equal( collection.at(1).id, 'test.002' );
    });

    it('should set from an object', function(){
        var incoming = {
            item_count:200,
            items:[
                { id:'test.001', type:'test' },
                { id:'test.002', type:'test' }
            ]
        };

        var collection = Common.entity.createEntityCollection();
        collection.set( incoming );
        assert.equal( collection.length, 2 );
        assert.equal( collection.get('item_count'), 200 );
        assert.equal( collection.at(1).id, 'test.002' );
        
    });
});
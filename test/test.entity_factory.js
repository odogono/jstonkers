var Common = require( '../src/common.js' );

describe('EntityFactory', function(){

    var testEntity = {
        type: 'test',
        ER:[
            { oneToMany: 'test_b' }
        ]
    };
    var testEntityB = { type: 'test_b', ER:[ { oneToMany:'test_c'} ] };
    var testEntityC = { type: 'test_c' };

    Common.entity.registerEntity( testEntityC );
    Common.entity.registerEntity( testEntityB );
    Common.entity.registerEntity( testEntity );
    
    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });

    describe('export', function(){

        it('should export a user', function(){
            var user = Common.entity.create(Common.entity.TYPE_USER);
            var result = Common.entity.Factory.toJSON( user, {referenceItems:true} );

            result[0].type.should.equal('user');
        });

        
        it('should export a team with a game and user', function(){
            var parent, child;

            parent = Common.entity.create(Common.entity.TYPE_TEST);
            child = Common.entity.create(Common.entity.TYPE_TEST_B);
            parent.test_b.add( child );

            var result = Common.entity.Factory.toJSON( parent );
            
            result[1]['_test:test_b'].should.equal( parent.cid );
        });

        it('should export a map of entities in the tree', function(){
            var a = Common.entity.create( Common.entity.TYPE_TEST );
            var b = Common.entity.create( Common.entity.TYPE_TEST_B );
            var c = Common.entity.create( Common.entity.TYPE_TEST_C );

            a.test_b.add( b );
            b.test_c.add( c ); 
            var result = Common.entity.Factory.toJSON( a, {toJSON:false,exportAsMap:true} );
            _.keys(result).length.should.equal(3);
            // print_var( result );
        });

        it('should export a map of entities in the tree again', function(){
            var a = Common.entity.create( Common.entity.TYPE_TEST, {name:'alpha'} );
            var b = Common.entity.create( Common.entity.TYPE_TEST_B, {name:'beta'} );
            var c = Common.entity.create( Common.entity.TYPE_TEST_C, {name:'charles'} );

            a.test_b.add( b );
            a.set('other', c);
            b.set('other', c);
            c.set('other', a);

            // serialise the hierarchy into a map of cids to entities
            var result = Common.entity.Factory.toJSON( a, {toJSON:false,exportAsMap:true} );
            _.keys(result).length.should.equal(3);
            var values = _.values(result);
            // print_ins(values[0].cid);
            values[0].cid.should.equal( a.cid );
            values[1].cid.should.equal( b.cid );
            values[2].cid.should.equal( c.cid );

            // turn this into a json doc
            var json = Common.entity.Factory.toJSON( result, {debug:true} );
            print_var(json);
        });


        /*
        it('should import a team with a game and a user', function(){
            var user = Common.entity.create(Common.entity.TYPE_USER, {id:'001'});
            var game = Common.entity.create(Common.entity.TYPE_GAME, {id:'002'});
            var team = game.createTeam( {name:'super team', id:'003'}, user );

            user.teams.length.should.equal(1);
            game.teams.length.should.equal(1);

            var json = Common.entity.toJSON( game );
            // print_var(json);
            var result = Common.entity.createFromJSON( json );
            result['user.001'].teams.length.should.equal(1);
            result['game.002'].teams.length.should.equal(1);

            var rejson = Common.entity.toJSON( result[user.id] );

            // _.each( result, function(e){
            //     print_var( e );
            // })
            // json.should.eql( rejson );
            // print_var( json );
        });//*/

    });
    
    describe('EntityCollection', function(){
        it('should export an array of entities', function(){
            var entities = [];
            for( var i=0;i<5;i++ ){
                entities.push( new Common.entity.create( Common.entity.TYPE_TEST, {name:'entity ' + i}));
            }
            var json = Common.entity.toJSON( entities );

            for( var i=0;i<5;i++ ){
                json.should.have.property( entities[i].cid );
            }
        })
    });//*/
});
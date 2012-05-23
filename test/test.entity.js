var Common = require( '../src/common.js' );

describe('Entity', function(){
    
    var testEntities = [
        { type: 'test_a', ER:[ { oneToMany: 'test_b' } ] },
        { type: 'test_b', ER:[ { oneToMany:'test_c'} ] },
        // { type: 'test_c' },
        // { type: 'test_d', ER:[ { oneToOne:'test_c', name:'friend'},{ oneToOne:'test_c', name:'colleague'} ] },
        { type: 'test_e', ER:[ {oneToOne:'test_f', name:'comrade'} ] },
        { type: 'test_f', ER:[ {oneToOne:'test_a', name:'associate'} ] }
    ];

    _.each( testEntities.reverse(), function(e){
        Common.entity.registerEntity(e);
    });

    describe('create', function(){

        it('should create from a type', function(){
            var inst = Common.entity.create( Common.entity.TYPE_TEST_A );
            assert( inst instanceof Common.entity.TestA.entity );
        });

        it('should create from a hash', function(){
            var inst = Common.entity.create( { type:'test_a', id:'mail.001'} );
            assert( inst instanceof Common.entity.TestA.entity );
        });

        it('should create from an entity', function(){
            var inst = Common.entity.create( 'test_a', "mail.001" );
            var oinst = Common.entity.create( inst );
            assert( oinst instanceof Common.entity.TestA.entity );
        });

        it('should create with a valid id', function(){
            var inst = Common.entity.create( Common.entity.TYPE_TEST_A, '001' );
            assert.equal( inst.id, '001');
            assert( inst instanceof Common.entity.TestA.entity);
            inst = Common.entity.create( Common.entity.TYPE_TEST_A, {id:'002'} );
            assert.equal( inst.id, '002');
        });

        it('should create from attr', function(){
            var inst = Common.entity.create( {id:'001', type:Common.entity.TYPE_TEST_A} );
            assert.equal( inst.id, '001');
        });

        it('should create from a def and attr', function(){
            var inst = Common.entity.create( Common.entity.TYPE_TEST_A, {name:'pink', id:'001'} );
            assert.equal( inst.id, '001');
            assert.equal( inst.get('name'), 'pink');
        });

        it('should have a default status of inactive', function(){
            var inst = Common.entity.create( {type:'test_a', id:'101'} );
            assert.equal( inst.get('status'), Common.Status.INACTIVE );
        });

        it('should set status', function(){
            var inst = Common.entity.create( {type:'test_a', status:Common.Status.ACTIVE, id:'101', debug:true} );
            assert.equal( inst.get('status'), Common.Status.ACTIVE );
        });
    });

    /*
    describe('register', function(){

        it('can', function(){
            var myEntity = {
                type: 'test',
                entity: Common.entity.Base.extend({})
            };

            Common.entity.registerEntity( myEntity );

            var inst = Common.entity.create( "test.001" );
            inst.should.be.an.instanceof( Common.entity.Test.entity );
        });
    });


    describe('one to one', function(){
        // Common.entity.registerEntity( {type:'testmail'} );
        // Common.entity.registerEntity( {type:'testmailbox', ER:{oneToMany:'testmail'} } );

        it('can', function(){
            var defA = {
                type: 'defa',
                entity: Common.entity.Base.extend({}),
                ER:[
                    { oneToOne: 'defb' }
                ]
            };
            var defB = {
                type: 'defb',
                entity: Common.entity.Base.extend({})
            };

            // register backwards because of referencing
            Common.entity.registerEntity(defB);
            Common.entity.registerEntity(defA);

            var instA = Common.entity.create( 'defa.001' );

            Common.should.exist( instA.setDefb );
        });
    });//*/

    /*
    describe('one to many', function(){

        var otmA = {
            type: 'otma',
            entity: Common.entity.Base.extend({}),
            ER:[
                { oneToMany: 'otmb', name:'friends', notes:'fromtest' }
            ]
        };

        var otmB = {
            type: 'otmb',
            entity: Common.entity.Base.extend({})
        };

        // register backwards because of referencing
        Common.entity.registerEntity(otmB);
        Common.entity.registerEntity(otmA);

        it('should have a 1toM field', function(){
            Common.debug = true;
            var instA = Common.entity.create( 'otma.001' );
            instA.should.be.an.instanceof( Common.entity.Base );
            Common.should.exist( instA.friends );
            instA.friends.should.be.an.instanceof( Common.entity.EntityCollection );
            Common.debug = false;
        });

        it('should allow addition', function(){
            var instA = Common.entity.create( 'otma.002' );
            var childA = Common.entity.create( 'otmb.001' );

            instA.friends.add( childA );
            instA.friends.at(0).should.eql( childA );
            instA.friends.get('item_count').should.equal(1);
            instA.friends.get('page_count').should.equal(1);
            instA.friends.length.should.equal(1);

            instA.friends.remove( childA );
            Common.should.not.exist( childA.getOtma() );
            instA.friends.get('item_count').should.equal(0);
            instA.friends.get('page_count').should.equal(0);
            instA.friends.length.should.equal(0);
        });
    });//*/

    /*
    describe('multiple one to many', function(){
        var motmA = {
            type: 'motma',
            ER:[
                { oneToMany: 'motmb', name:'friends' },
                { oneToMany: 'motmc', name:'enemies' }
            ]
        };

        Common.entity.registerEntity( { type: 'motmc' } );
        Common.entity.registerEntity( { type: 'motmb' } );
        Common.entity.registerEntity( motmA );

        it('should have the right fields', function(){
            var instA = Common.entity.create( 'motma.001' );
            Common.should.exist( instA.friends );
            Common.should.exist( instA.enemies );
        });

        it('should create with collection properties', function(){
            var instA = Common.entity.create( {id:'motma.003', friends:{item_count:4, comment:'nice!'} } );
            Common.should.not.exist( instA.get('friends') );
            instA.friends.get('item_count').should.equal(4);
            instA.friends.get('comment').should.equal('nice!');
        });
    });

    describe('user', function(){
        var user = Common.entity.create( 'user.001' );

        print_ins( user, false, 2, true );
    })//*/

    describe('flatten', function(){
        it('should produce a flattened map of a one2one relation', function(){
            var a = Common.entity.create({
                id:"enigma_1",
                name: "enigma",
                status: "atv",
                type: "test_e",
                comrade:{
                    id:"foxtrot_1",
                    name: "foxtrot",
                    status: "atv",
                    type:"test_f",
                    associate:{
                        id:'alpha_a',
                        status:'atv',
                        type:'test_a'
                    }
                }
            });
            
            var result = a.flatten();
            assert.equal( _.keys(result).length, 3 );
            assert( result.enigma_1 );
            assert( result.foxtrot_1 );
            assert( result.alpha_a );
        });
    });

    describe('entity.set', function(){
        it('should set a one2one from a serialised form', function(){
            var ser = {
                id:"enigma_1",
                name: "enigma",
                status: "atv",
                type: "test_e",
                comrade:{
                    id:"foxtrot_1",
                    name: "foxtrot",
                    status: "atv",
                    type:"test_f"
                }
            };
            var a = Common.entity.create( Common.entity.TYPE_TEST_E, {name:'enigma'} );
            assert.equal( a.type, Common.entity.TYPE_TEST_E );
            a.set( ser );
            assert.equal( a.id, 'enigma_1');

            var b = a.get('comrade');
            assert( b instanceof Common.entity.Base );
            assert.equal( b.id, 'foxtrot_1');
            assert.equal( b.type, Common.entity.TYPE_TEST_F );
            assert.equal( b.get('name'), 'foxtrot' );
        });

        it('should set a one2many from a serialised form', function(){
            var json = {
                id:"alpha_1",
                name:"alpha",
                type:"test_a",
                status:"atv",
                test_b:[
                    {
                        id:"beta_1",
                        name:"beta",
                        type:"test_b",
                        status:"atv"
                    }
                ]
            };
            var a = Common.entity.create( Common.entity.TYPE_TEST_A );
            a.set( json );
            assert.equal( a.id, "alpha_1" );
            var b = a.test_b.at(0);
            assert.equal( b.id, "beta_1" );
            assert.equal( b.type, "test_b" );
        });

        it('should set an attribute on one2one associations', function(){
            var a = Common.entity.create({
                id:"enigma_e",
                name: "enigma",
                status: "atv",
                type: "test_e",
                comrade:{
                    id:"foxtrot_f",
                    name: "foxtrot",
                    status: "atv",
                    type:"test_f"
                }
            });
            assert.equal( a.type, Common.entity.TYPE_TEST_E );
            assert.equal( a.get('comrade').type, Common.entity.TYPE_TEST_F );
            assert.equal( a.get('status'), Common.Status.ACTIVE );
            assert.equal( a.get('comrade').get('status'), Common.Status.ACTIVE );

            a.set('status', Common.Status.INACTIVE, {setRelated:true,debug:true} );
            assert.equal( a.get('status'), Common.Status.INACTIVE );
            assert.equal( a.get('comrade').get('status'), Common.Status.INACTIVE );
        });//*/
    });

});
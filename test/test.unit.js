require( '../src/common' );
var Server = require( '../src/main.server' );
var Entity = jstonkers.entity;
var Vector2f = jstonkers.Vector2f;
var UnitPainter = require('./support/unit_painter');

describe('Unit', function(){

    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });



    describe('creation',function(){

    });


    describe('movement',function(){
        it('should emit changes to fields', function(){
            var unit = Entity.create(Entity.TYPE_UNIT);
            unit.on('change:tar', function(unit,tar){
                // log('unit evt ' + tar );
            });
            unit.on('change:pos', function(unit,tar){
                // log('unit pos ' + tar );
            });
            unit.set('tar', [10,10] );
            unit.set('tar', [20,10] );
            var pos = unit.get('pos');
            pos[0] = 3;
            // print_ins( pos );
            unit.set('pos', pos );
            unit.set('mcguffin', true);
        });//*/

        it('should move towards a target', function(done){
            var unit = Entity.create(Entity.TYPE_UNIT);
            var debugOut = new UnitPainter();
            var finished = false;
            var target = Vector2f.create(10,0);
            var targetDistance = 0.5;


            unit.on('all', function(evt){
                // log('unit evt ' + evt );
            });
            unit.on('target:arrive', function(unit,dist){
                // log('arrived ' + dist);
                assert( dist <= targetDistance );
                unit.halt();
                finished = true;
            });
            unit.on('change:pos', function(unit,tar){
                // log('unit pos ' + tar );
            });
            
            assert.deepEqual( unit.get('pos'), [0,0] );


            unit.moveTo( target, {distance:targetDistance} );
            
            assert.deepEqual( unit.get('tar'), target );
            
            while( !finished ){
                unit.process( 1 );
            }

            assert( finished );
            assert( Vector2f.isEqual( unit.get('vel'), [0,0] ) );

            // print_var( unit );
            
            done();
            // createImage( unit, done );
            // debugOut.save( Common.path.join(Common.paths.root,'output.png'), done );
        });//*/
    });

});
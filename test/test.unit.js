require( '../src/common' );
var Server = require( '../src/main.server' );
var Entity = jstonkers.entity;
var Canvas = require('canvas'), Image = Canvas.Image, fs = require('fs');
var Vector2f = require('../src/vector2f');

var UnitPainter = function(){
    var canvas = this.canvas = new Canvas(500, 500);
    var ctx = this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#000';
    this.ctx.fillRect(0,0,500,500);
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    // ctx.scale( 4, 4 );
};

_.extend( UnitPainter.prototype, {
    paintUnit: function( unit ){
        var ctx = this.ctx;
        var pos = unit.get('pos');
        var heading = unit.heading();
        var target = unit.get('tar');
        var scale = 10;
        ctx.save();

        ctx.translate(pos[0]*scale, pos[1]*scale);
        
        ctx.beginPath();
        ctx.arc(0, 0, 1*scale, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.strokeStyle = '#000'; ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo( heading[0]*scale, heading[1]*scale );
        ctx.closePath();
        ctx.strokeStyle = '#F00'; ctx.stroke();

        ctx.restore();

        this.paintTarget( unit );
    },

    paintTarget: function( unit ){
        var ctx = this.ctx;
        var pos = unit.get('pos');
        var heading = unit.get('heading');
        var target = unit.get('tar');
        var scale = 10;

        ctx.save();
        ctx.translate(target[0]*scale, target[1]*scale);

        ctx.moveTo( -1*scale, -1*scale );
        ctx.lineTo( 1*scale, 1*scale );
        ctx.moveTo( -1*scale, 1*scale );
        ctx.lineTo( 1*scale, -1*scale );
        ctx.strokeStyle = '#00F'; ctx.stroke();

        ctx.restore();
    },

    save: function( callback ){
        this.canvas.toBuffer(function(err, buf){
            if (err) callback(err);
            fs.writeFile('unit.png', buf);
            callback();
        });
    }
});


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
                log('unit evt ' + tar );
            });
            unit.on('change:pos', function(unit,tar){
                log('unit pos ' + tar );
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
            print_var( unit );
            unit.on('all', function(evt){
                // log('unit evt ' + evt );
            });
            unit.on('target-arrive', function(unit,dist){
                log('arrived ' + dist);
                finished = true;
            });
            unit.on('change:pos', function(unit,tar){
                // log('unit pos ' + tar );
            });
            
            assert.deepEqual( unit.get('pos'), [0,0] );

            unit.moveTo( [10,10], {distance:0.5} );

            assert.deepEqual( unit.get('tar'), [10,10] );
 
            for( var i=0;i<400;i++){
                if( finished )
                    break;
                unit.process( 1 );
                if( (i%5) == 0 )
                    debugOut.paintUnit( unit );
            }

            print_var( unit );
            // done();
            // createImage( unit, done );
            debugOut.save( done );
        });//*/
    });

});
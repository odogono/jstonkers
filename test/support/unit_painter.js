var Canvas = require('canvas'), Image = Canvas.Image, fs = require('fs');
var Vector2f = require('../../src/vector2f');

var UnitPainter = module.exports = function(){
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

    save: function( file, callback ){
        this.canvas.toBuffer(function(err, buf){
            if (err) callback(err);
            fs.writeFile(file, buf);
            callback();
        });
    }
});
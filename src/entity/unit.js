var entity = require('./entity');
var Vector2f = require('../vector2f');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#unit';
exports.type = 'unit';

exports.entity = entity.Entity.extend({

    defaults:{
        // pos:Vector2f.create(),//[0,0],  // position
        tar:null,  // target
        // vel:[0,0],  // velocity
        r:1,        // radius
        angle: 0
        // side:Vector2f.create(-1,0),
        // heading:Vector2f.create(0,-1),
    },

    initialize: function(){
        this.set({
            pos:Vector2f.create(),
            vel:Vector2f.create() });
    },



    process: function( dt, options, callback ){
        var pos = this.get('pos');
        var vel = this.get('vel');
        var tar = this.get('tar');
        var rad = this.get('r');
        if( callback )
            callback();
    },

    set: function(key, value, options) {
        var attrs;
        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = {};
            attrs[key] = value;
        }
        if (!attrs) return this;

        if( attrs.degrees ){
            attrs.angle = attrs.degrees * (Math.PI / 180);
            delete attrs.degrees;
        }

        return entity.Entity.prototype.set.call( this, attrs );
    },

    /**
     * Returns a heading vector
     * @param  {angle} angle
     * @return {Vector2f}
     */
    heading: function(angle){
        var angle = _.isUndefined(angle) ? this.get('angle') : angle;
        var cos = Math.cos( angle );
        var sin = Math.sin( angle );
        return Vector2f.create( -(sin * -1), cos * -1 );
    },

    /**
     * Returns the heading 90 degrees to the right
     * @param  {angle} angle
     * @return {Vector2f}
     */
    side: function(angle){
        var heading = this.heading(angle);
        return Vector2f.turnRight(null,heading);
    },

    // updateHeadingFromAngle: function( angle ){
    //     var angle = _.isUndefined(angle) ? this.get('angle') : angle;
    //     var cos = Math.cos( angle );
    //     var sin = Math.sin( angle );
    //     var heading = [ -(sin * -1), cos * -1 ];
    //     var side = [ heading[1], -heading[0] ];
    //     this.set({angle:angle, heading:heading, side:side});
    // },

    // updateHeadingFromVelocity: function(){

    // }
});


exports.create = function(attrs, options){
    options = (options || {});
    var result = entity.create( _.extend({type:'unit'}, attrs) );
    return result;
}
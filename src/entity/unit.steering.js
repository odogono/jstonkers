var unit = require('./unit');
var Vector2f = require('../vector2f');

var constants = {
    ALL             : -1,
    NONE            : 0,
    ARRIVE          : 1<<0,
    SEEK            : 1<<1,
    SEPARATION      : 1<<2,
    PURSUIT         : 1<<3,
    INTERPOSE       : 1<<4,
    WALL_AVOID      : 1<<5,
    OFFSET_PURSUIT  : 1<<6,
    COHESION        : 1<<7,
    WANDER          : 1<<8,

    SLOW            : 200,
    NORMAL          : 100,
    FAST            : 50,
    SUPER_FAST      : 10,

    N_DECELERATION_TWEAKER : 0.3
};

_.extend( exports, constants );

_.extend( unit.entity.prototype, {
    defaults: _.extend(unit.entity.prototype.defaults,{
        flags: constants.NONE,
        max_turn_rate: 1,
        max_force: 0.25,
        max_speed: 1,
        mass: 1,
        interpose_distance: 0,
        braking_distance: 0,
        braking_rate: 0.2,
        force: [0,0],
        result: [0,0],
        accel:[0,0],
        flag_stack: []
    }),


    moveTo: function( target, options ){
        options = options || {};
        var params = {tar:target};
        params.tar_d = options.distance || null;

        this.set(params);
        this.activate( constants.ARRIVE );    
    },

    activate: function(flag){
        var flags = this.get('flags');
        if( flag !== constants.NONE ){
            this.set( 'flags', flags |= flag );
        }
    },
    deactivate: function(flag){
        var flags = this.get('flags');
        if( flag !== constants.NONE ){
            this.set( 'flags', flags &= ~flag );
        }
    },
    isActive: function(flag){
        return (this.get('flags') & flag) !== 0;
    },
    pushFlags: function(){
        var flagStack = this.get('flag_stack');
        flagStack.push( this.get('flags') );
        this.set('flags', constants.NONE );
    },
    popFlags: function(){
        var flagStack = this.get('flag_stack');
        if( flagStack.length > 0 ){
            this.set('flags', flagStack.pop() );
        } else {
            this.set('flags', constants.NONE );
        }
    },


    process: function( dt, options, callback ){

        var force = Vector2f.create();
  
        this.sumForces( force );
  
        Vector2f.truncate( force, force, this.get('max_force') );
        // log('force ' + Vector2f.length(force) + ' max ' + this.get('max_force') );
        // self.force:truncate( self.player.max_force )

        this.updateVelocity( force );

        // log('vel ' + this.get('vel') );
        var position = this.get('pos');
        var velocity = this.get('vel');
        position = Vector2f.add( null, position, velocity );

        // log('set pos ' + position);
        this.set('pos', position);

        if( callback )
            callback();
    },

    sumForces: function( force ){
        // var force = Vector2f.create();
        var accum = Vector2f.create();

        // -- the soccer players must always tag their neighbors
        // -- find_neighbours
        // 
        if( this.isActive( constants.ARRIVE ) ){
            var arrive = this.arrive( constants.FAST );

            Vector2f.add( accum, accum, arrive );

            if( !this.accumulateForce( force, accum ) ){
                return;
            }

        }

        if( this.isActive( constants.SEEK ) ){
            var arrive = this.seek();
            Vector2f.add( accum, accum, arrive );

            if( !this.accumulateForce( force, accum ) ){
                return;
            }
        }
    },


    accumulateForce: function( force, forceToAdd ){
        var magSoFar = Vector2f.length( force );
        var magRemaining = this.get('max_force') - magSoFar;

        if( magRemaining <= 0 )
            return false;

        var magToAdd = Vector2f.length( forceToAdd );

        if( magToAdd > magRemaining )
            magToAdd = magRemaining;

        // log( 'mags ' + magToAdd + '/' + magRemaining );
        // log('ok! ' + (force) + ' ' + forceToAdd);

        
        Vector2f.normalise( forceToAdd, forceToAdd, magToAdd );
        
        Vector2f.add( force, force, forceToAdd );

        // log('ok! ' + (force) + ' ' + magToAdd);
        return true
    },



    arrive: function( deceleration ){
        var position = this.get('pos');
        var target = this.get('tar');
        var velocity = this.get('vel');
        var targetDistance = this.get('tar_d');

        if( !target )
            return null;
        
        // if not target then return nil end
        // if not self.temp_arrive then self.temp_arrive = odgl_vector_create() end
        // local temp = self.temp_arrive
        var temp = Vector2f.sub( null, target, position );
        var dist = Vector2f.length(temp);
        
        // log('targetDistance: ' + dist + ' / ' + targetDistance );
        
        if( dist <= targetDistance ){
            this.trigger('target-arrive', this, targetDistance );
            return;
        }
        
        // -- print("a arrive: " .. self.temp_arrive:to_s() )
        if( dist > 0 ){
        
            // -- calculate the speed required to reach the target given
            // -- the desired deceleration
            var speed = dist / ( deceleration * constants.N_DECELERATION_TWEAKER); // 50 * 0.3 = 15
            // log('dist ' + dist + ' deac ' + (deceleration * constants.N_DECELERATION_TWEAKER) );

            
            // -- make sure the velocity does not exceed the max
            speed = Math.min( speed, this.get('max_speed') );

            // -- print("dist " .. dist)
            // -- print("speed " .. speed)
            // -- from here proceed just like Seek, except we don't need to
            // -- normalise the totarget vector because we ahve already gone
            // -- to the trouble of calculating its length: dist
            Vector2f.mul( temp, temp, speed/dist );
            Vector2f.sub( temp, temp, velocity );

            // temp:mul( speed / dist )
            // temp:sub( player.velocity )
            // -- print("temp_arrive " .. self.temp_arrive:to_s() )
        
        } else {
            Vector2f.zero( temp );
        }
        // -- print("b arrive: " .. self.temp_arrive:to_s() )
        
        return temp
    },


    // 
    // Given a target, this behaviour returns a steering force which
    // will align the agent with the target and move the agent in the
    // desired direction
    //
    seek: function(){
        var position = this.get('pos');
        var target = this.get('tar');
        var velocity = this.get('vel');

        if( !target )
            return null;

        // local player = self.player
        // if not self.temp_seek then self.temp_seek = odgl_vector_create() end
        // local temp = self.temp_seek
        
        var temp = Vector2f.sub( null, target, position );
        Vector2f.normalise( temp, temp );
        // temp:set( player.target )
        // temp:sub( player.position )
        // temp:normalise()
        
        // -- print("seek a: " .. temp:to_s() )
        // -- print("seek b: " .. player.position:to_s() )
        // -- print("seek c: " .. player.target:to_s() )
        
        Vector2f.mul( temp, temp, this.get('max_speed') );
        Vector2f.sub( temp, temp, velocity );
        // temp:mul( player.max_speed )
        // temp:sub( player.velocity )
        
        // -- print("seek: " .. temp:to_s() )
        return temp
    },

    updateVelocity: function( force ){
        var velocity = this.get('vel');
        var heading;
        // var force = this.get('force');
        var brakingRate = this.get('braking_rate');

        // if no steering force is produced, decelerate the player
        // by applying a braking force
        if( Vector2f.isZero(force) ){
            // if there is also no velocity, then just return
            if( Vector2f.isZero(velocity) ){
                return;
            }

            Vector2f.mul( velocity, velocity, brakingRate );
        }

        // the steering force's side component is a force that rotates the 
        // player about its axis. We must limit the rotation so that a player
        // can only turn by PlayerMaxTurnRate rads per update.
        var side = this.side();
        var clamp = 0.5;
        var sideComponent = Vector2f.dot( side, force ) * this.get('max_turn_rate');
        var turningForce = Vector2f.clamp1f( sideComponent, -clamp, clamp )
        // log('turningForce ' + turningForce );

        // rotate the heading vector
        this.set('angle', this.get('angle') - turningForce );
        // this.updateHeadingFromAngle( this.get('angle') - turningForce );
        // heading = this.get('heading');
        heading = this.heading();

        // make sure the velocity vector points in the same direction as
        // the heading vector
        var vl = Vector2f.length(velocity);
        Vector2f.set( velocity, heading );
        Vector2f.mul( velocity, velocity, vl );

        // now to calculate the acceleration due to the force exterted by
        // the forward component of the steering force in the direction
        // of the players heading
        var forwardComponent = Vector2f.dot( heading, force );
        var acceleration = Vector2f.mul( null, heading, forwardComponent / this.get('mass') );


        Vector2f.add( velocity, velocity, acceleration ); // NOTE, this never works because the original velocity is never updated

        // make sure the player does not exceed max velocity
        Vector2f.truncate( velocity, velocity, this.get('max_speed') );

        this.set({vel:velocity} );
    }
});
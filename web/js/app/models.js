//sprite.js


jstonkers.model.Sprite = Backbone.Model.extend({
});


//unit.js


/**
*
*/
jstonkers.model.Unit = jstonkers.model.Sprite.extend({
    
    /**
    *
    */
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        delete attrs.match;
        delete attrs.team;
        return attrs;
    },
});

/**
*
*/
jstonkers.model.UnitList = Backbone.Collection.extend({
    model: jstonkers.model.Unit, 
});


//team.js


/**
*   A Team has:
*       - a list of units
*/

jstonkers.model.Team = Backbone.Model.extend({

    /**
    *
    */
    add : function( unit ) {
        var units = this.getUnits();
        units.add( unit );
    },
    
    /**
    *
    */
    getUnits: function() {
        var units = this.get('units');
        if( !units ){
            units = new jstonkers.model.UnitList();
            this.attributes.units = units;
        }
        return units;
    },

    /**
    *
    */
    set : function( attrs, options ) {
        var team = this;
        
        if( _.isArray(attrs.units) ){
            _.each(attrs.units, function(unit){
                unit.set({team:team}, {silent:true});
            });
            this.getUnits().refresh( attrs.units );
            delete attrs.units;
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    /**
    *
    */
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        // convert the object collection into an array of ids
        if( attrs.units )
            attrs.units = attrs.units.map(function(unit){
                return unit.id; 
            });
        delete attrs.match;
        delete attrs.player;
        return attrs;
    },
    
});

jstonkers.model.TeamList = Backbone.Collection.extend({
    model:jstonkers.model.Team,  
});


//player.js


/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    
    /**
    *
    */
    set : function( attrs, options ) {
        if( attrs.team ){
            attrs.team.set({player:this},{silent:true});
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    /**
    *
    */
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.team && !_.isString(attrs.team) )
            attrs.team = attrs.team.id;
        delete attrs.match;
        return attrs;
    },
});

/**
*
*/
jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,  
});


//match.js


/**
*   
*/
jstonkers.model.Match = Backbone.Model.extend({
    
    /**
    *
    */
    initialize: function() {
        var players = new jstonkers.model.PlayerList();
        var teams = new jstonkers.model.TeamList();
        var units = new jstonkers.model.UnitList();
        
        _.bindAll(this, 'onChange');
        this.set({ players:players, teams:teams, units:units, levels:[], bounds:[], window:[], zoom:1}, {silent:true, initialise:true});
        // players.bind('refresh', this.onChange);
        // teams.bind('refresh', this.onChange);
        // units.bind('refresh', this.onChange);
        // this.bind('change', this.onChange );
    },
    
    /**
    *
    */
    url : function() {
        return '/match/' + (this.id || 'new');
    },
    
    /**
    *   Converts a response into the hash of attributes to be `set` on
    *   the model.
    */
    parse : function( resp ){
        var units = {}, teams = {}, match = this;
        
        resp.units = _.map( resp.units, function(u){
            u.match = match;
            return new jstonkers.model.Unit(u);
        });
        
        // convert to assoc array so that teams may resolve unitss
        _.each( resp.units, function(unit){
            units[unit.id] = unit;
        });
        
        resp.teams = _.map( resp.teams, function(t){
            // convert the array of unit ids into unit references
            t.units = _.map( t.units, function(uid){
               return units[uid];
            });
            t.match = match;
            return new jstonkers.model.Team(t);
        });
        
        // convert to assoc array so that players may resolve teams
        _.each( resp.teams, function(team){
            teams[team.id] = team;
        });
        
        resp.players = _.map( resp.players, function(p){
            // convert the team id to a team reference
            p.team = teams[p.team];
            p.match = match;
            return new jstonkers.model.Player(p);
        });
        return resp;
    },
    
    /**
    *
    */
    set : function(attrs, options) {
        var self = this;
        var units = this.get('units');
        var teams = this.get('teams');
        var players = this.get('players');
        
        if( attrs.world ){
            Backbone.Model.prototype.set.call(this, attrs.world, options);
            delete attrs.world;
        }
                
        if( !options || !options.initialise ){
            if( attrs.units ){
                units.refresh( attrs.units );
                this.trigger('change:units', units );
                delete attrs.units;
            }
            if( attrs.teams ) {
                teams.refresh( attrs.teams );
                this.trigger('change:teams', teams );
                delete attrs.teams;
            }
            if( attrs.players ) {
                players.refresh( attrs.players );
                this.trigger('change:players', players );
                delete attrs.players;
            }
        }
        
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    /**
    *
    */
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.units )
            attrs.units = attrs.units.toJSON();
        if( attrs.teams )
            attrs.teams = attrs.teams.toJSON();
        if( attrs.players )
            attrs.players = attrs.players.toJSON();
        return attrs;
    },
    
});



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
        var unit,team,player,hasAdded=false;
        
        options || (options = { update:true });
        
        if( attrs.world ){
            Backbone.Model.prototype.set.call(this, attrs.world, options);
            delete attrs.world;
        }
        
        if( !options.initialise ){
            
            if( attrs.units ){
                hasAdded=false;
                _.each(attrs.units, function(u){
                    unit = units.get(u.id);
                    if( unit ) {
                        unit.set(u);
                    }else{
                        units.add(u,{silent:true});
                        hasAdded=true;
                    }
                });
                if( hasAdded )
                    this.trigger('change:units', units );
                delete attrs.units;
            }
            
            if( attrs.teams ){
                hasAdded=false;
                _.each(attrs.teams, function(t){
                    team = teams.get(t.id);
                    if( team ) {
                        team.set(t);
                    }else{
                        teams.add(t,{silent:true});
                        hasAdded=true;
                    }
                });
                if( hasAdded )
                    this.trigger('change:teams', teams );
                delete attrs.teams;
            }
            
            if( attrs.players ){
                hasAdded=false;
                _.each(attrs.players, function(p){
                    player = players.get(p.id);
                    if( player ) {
                        player.set(p);
                    }else{
                        players.add(p,{silent:true});
                        hasAdded=true;
                    }
                });
                if( hasAdded )
                    this.trigger('change:players', players );
                delete attrs.players;
            }
        }
        // else if( !options.initialise ){
        //     if( attrs.units ){
        //         units.refresh( attrs.units );
        //         this.trigger('change:units', units );
        //         delete attrs.units;
        //     }
        //     if( attrs.teams ) {
        //         teams.refresh( attrs.teams );
        //         this.trigger('change:teams', teams );
        //         delete attrs.teams;
        //     }
        //     if( attrs.players ) {
        //         players.refresh( attrs.players );
        //         this.trigger('change:players', players );
        //         delete attrs.players;
        //     }
        // }
        
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
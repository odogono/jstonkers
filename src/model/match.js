jstonkers.model.Match = Backbone.Model.extend({
    
    initialize: function() {
        var players = new jstonkers.model.PlayerList();
        var teams = new jstonkers.model.TeamList();
        var units = new jstonkers.model.UnitList();
        
        _.bindAll(this, 'onChange');
        this.set({ players:players, teams:teams, units:units, levels:[], bounds:[], window:[], zoom:1}, {silent:true, initialise:true});
        players.bind('refresh', this.onChange);
        teams.bind('refresh', this.onChange);
        units.bind('refresh', this.onChange);
        this.bind('change', this.onChange );
    },
    
    url : function() {
        return '/match/' + (this.id || 'new');
    },
    
    set : function(attrs, options) {
        var self = this;
        var units = this.get('units');
        var teams = this.get('teams');
        var players = this.get('players');
        
        if( attrs.world ){
            Backbone.Model.prototype.set.call(this, attrs.world, options);
            delete attrs.world;
        }
        
        // _.each( attrs, function(value,key,list){
        //    console.log("setting " + key); 
        // });
        
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
    
    onChange: function( players ){
        var self = this;
        var units = this.get('units');
        var teams = this.get('teams');
        var players = this.get('players');
        var teamID;
        var replacementUnits;
        
        units.each( function(v){ v.set({match:self}) });
        
        teams.each( function(team) { 
            team.set({match:self});
            
            // attempt to replace stub with real unit
            replacementUnits = team.get('units').map( function(unit){
                if( unit.get('stub') ){
                    if( units.get(unit.id) ){
                        unit = units.get(unit.id)
                        unit.set({team:team, match:self}, {silent:true});
                        return unit;
                    }
                }
            });
            
            // remove any null units
            replacementUnits = _.select( replacementUnits, function(unit){ return unit !== undefined });
            team.set({ units:replacementUnits}, {silent:true} );
        });
        
        players.each( function(player){ 
            player.set({match:self}); 
            teamID = player.get('team');
            if( _.isString(teamID) ){
                // log("updating player team " + teamID );
                player.set({team:teams.get(teamID) || teamID }, {silent:true});
            }
        });
    },
    
    
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
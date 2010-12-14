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
    
    set : function(attrs, options) {
        var self = this;
        
        if( attrs.world ){
            Backbone.Model.prototype.set.call(this, attrs.world, options);
            delete attrs.world;
        }
        
        // _.each( attrs, function(value,key,list){
        //    console.log("setting " + key); 
        // });
        
        if( !options || !options.initialise ){
            if( attrs.units ){
                this.get('units').refresh( attrs.units );
                delete attrs.units;
            }
            if( attrs.teams ) {
                this.get('teams').refresh( attrs.teams );
                delete attrs.teams;
            }
            if( attrs.players ) {
                this.get('players').refresh( attrs.players );
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
        
        // players.match = this;
        // teams.match = this;
        // units.match = this;
        
        units.each( function(v){ v.set({match:self}) });
        teams.each( function(v){ v.set({match:self}) });
        
        players.each( function(player){ 
            player.set({match:self}); 
            teamID = player.get('team');
            if( _.isString(teamID) ){
                // log("updating player team " + teamID );
                player.set({team:teams.get(teamID) || teamID }, {silent:true});
            }
        });
        // log("ON CHANGE");
    },
    
    // onChangePlayers: function(){
    //     var self = this;
    //     var units = this.get('units');
    //     var teams = this.get('teams');
    //     var players = this.get('players');
    //     
    //     log("players changed");
    //     
    //     // units.each( function(unit){ unit.match = self; });
    //     // teams.each( function(team){ team.match = self; });
    //     
    //     // players.each( function(player){
    //     //     if( _.isString(player.team) ){
    //     //         log("updating player team");
    //     //         player.team = teams.get( player.team ) || player.team;
    //     //     }
    //     // });
    // },
    
    // resolvePlayers: function(){
    //     console.log('resolving players');
    //     
    //     this.get('players').each( function(player){
    //         if( !player.get('stub') ) return;
    //         console.log("replacing " + player.id );
    //     })
    //     console.log( JSON.stringify(this.get('players') ) );
    // },
    
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
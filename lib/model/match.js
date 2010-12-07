jstonkers.model.Match = Backbone.Model.extend({
    initialize: function(){
        var players = new jstonkers.model.PlayerList();
        var teams = new jstonkers.model.TeamList();
        var units = new jstonkers.model.UnitList();
        
        _.bindAll(this, 'onChange', 'onChangePlayers');
        this.set({ players:players, teams:teams, units:units, levels:[], bounds:[], window:[], zoom:1}, {silent:true});
        this.bind('change', this.onChange );
        
        this.get('players').bind('change', this.onChangePlayers ).bind('refresh', this.onChangePlayers );
    },
    
    set : function(attrs, options) {
        var self = this;
        // var existingPlayers = this.get('players');
        
        // if( attrs.players ) this.set({resolvePlayers:true}, {silent:true});
        
        // if( attrs.players && _.isArray(attrs.players)){
        //     _.each( attrs.players, function(id){
        //         if( !existingPlayers.get(id) ) {
        //             existingPlayers.add( {id:id, stub:true, silent:true} );
        //             console.log("adding stub for player " + id );
        //             self.set({resolvePlayers:true}, {silent:true});
        //         }
        //     });
        //     delete attrs.players;
        // }
        
        _.each( attrs, function(value,key,list){
           // console.log("setting " + key); 
        });
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    onChange: function( players ){
        var self = this;
        this.get('players').match = this;
        this.get('teams').match = this;
        this.get('units').match = this;
        console.log("+++ changed stuff");
        
        this.get('units').each( function(v){ v.match = self; });
        this.get('teams').each( function(v){ v.match = self; });
        this.get('players').each( function(v){ v.match = self; });
    },
    
    onChangePlayers: function(){
        var self = this;
        var units = this.get('units');
        var teams = this.get('teams');
        var players = this.get('players');
        
        // units.each( function(division){ division.match = self; });
        // teams.each( function(team){ team.match = self; });
        
        players.each( function(player){
            if( _.isString(player.team) ){
                player.team = teams.get( player.team ) || player.team;
            }
        });
    },
    
    resolvePlayers: function(){
        console.log('resolving players');
        
        this.get('players').each( function(player){
            if( !player.get('stub') ) return;
            console.log("replacing " + player.id );
        })
        console.log( JSON.stringify(this.get('players') ) );
    },
});


jstonkers.model.Sprite = Backbone.Model.extend({
    set : function(attrs, options) {
        if( attrs.position ) {
            this.set( {screen:{left: attrs.position[0], top: attrs.position[1]} });
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
});


jstonkers.model.Unit = jstonkers.model.Sprite.extend({
});


jstonkers.model.UnitList = Backbone.Collection.extend({
    model: jstonkers.model.Unit,
    
});



/**
*   A Team has:
*       - a list of units
*/
jstonkers.model.Team = Backbone.Model.extend({
    
    set : function(attrs, options) {
        var units = this.get('units');
        if( !units ){
            units = new jstonkers.model.UnitList();
            this.attributes.units = units;
        }
        
        if( attrs.units && _.isArray(attrs.units)){
            units.refresh(
                _.map( attrs.units, function(unitID){
                    return {id:unitID, stub:true};
                }), {silent:true} );
            delete attrs.units;
        }
        
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.units ){
            attrs.units = attrs.units.map(function(div){ return div.id });
        }
        return attrs;
    },
    
});

jstonkers.model.TeamList = Backbone.Collection.extend({
    model:jstonkers.model.Team,
     
});


/**
*   A Player has:
*   - an associated team
*/
jstonkers.model.Player = Backbone.Model.extend({
    initialize: function() {
        this.set({team:null});
    },
});

jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,
     
});


jstonkers.model.Match = Backbone.Model.extend({
    initialize: function(){
        _.bindAll(this, 'onChange', 'onChangePlayers');
        this.set({ levels:[], bounds:[], window:[], zoom:1}, {silent:true}); //players:new jstonkers.model.PlayerList(), 
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
        
        // units.each( function(unit){ unit.match = self; });
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

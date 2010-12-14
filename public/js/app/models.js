//sprite.js


jstonkers.model.Sprite = Backbone.Model.extend({
    set : function(attrs, options) {
        if( attrs.position ) {
            this.set( {screen:{left: attrs.position[0], top: attrs.position[1]} });
        }
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
});


//unit.js


jstonkers.model.Unit = jstonkers.model.Sprite.extend({
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        delete attrs.match;
        return attrs;
    },
});


jstonkers.model.UnitList = Backbone.Collection.extend({
    model: jstonkers.model.Unit, 
});


//team.js


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
        
        if( attrs.units && _.isArray(attrs.units) ){
            
            if( attrs.units.length > 0 && _.isString(attrs.units[0]) ) {
                units.refresh(
                    _.map( attrs.units, function(unitID){
                        return {id:unitID, stub:true};
                    }), {silent:true} );        
            } else {
                units.refresh( attrs.units, {silent:true} );
            }
            
            delete attrs.units;
        }
        
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        // convert the object collection into an array of ids
        if( attrs.units )
            attrs.units = attrs.units.map(function(div){ return div.id });
        delete attrs.match;
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
    // initialize: function() {
    //     this.set({team:null});
    // },
    
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.team && !_.isString(attrs.team) )
            attrs.team = attrs.team.id;
        delete attrs.match;
        return attrs;
    },
});

jstonkers.model.PlayerList = Backbone.Collection.extend({
    model:jstonkers.model.Player,  
});


//match.js


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



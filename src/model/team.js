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
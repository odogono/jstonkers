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
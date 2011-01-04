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
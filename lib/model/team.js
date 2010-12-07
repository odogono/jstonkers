/**
*   A Team has:
*       - a list of divisions
*/

jstonkers.model.Team = Backbone.Model.extend({
    
    set : function(attrs, options) {
        var divisions = this.get('divisions');
        if( !divisions ){
            divisions = new jstonkers.model.DivisionList();
            this.attributes.divisions = divisions;
        }
        
        if( attrs.divisions && _.isArray(attrs.divisions)){
            divisions.refresh(
                _.map( attrs.divisions, function(divisionID){
                    return {id:divisionID, stub:true};
                }), {silent:true} );
            delete attrs.divisions;
        }
        
        Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    toJSON : function() {
        var attrs = Backbone.Model.prototype.toJSON.call(this);
        if( attrs.divisions ){
            attrs.divisions = attrs.divisions.map(function(div){ return div.id });
        }
        return attrs;
    },
    
});

jstonkers.model.TeamList = Backbone.Collection.extend({
    model:jstonkers.model.Team,  
});
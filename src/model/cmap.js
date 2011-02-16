var fs = require('fs'),
    assert = require('assert'),
    undefined;

// log(inspect(jstonkers.utils));
function CMapNode(){};

CMapNode.prototype = {
    isEqual: function(other) {
        return this.position.isEqual(other.position);
    },
    
    // getCost: function(){
    //     return this.costFromStart + this.estimatedCostToGoal;
    // },
    
    getCost: function(other) {
        if( other ){
            return 1;
        }
        return this.costFromStart + this.estimatedCostToGoal;
    },
    
    getEstimatedCost: function(other){
        var dx = Math.abs( this.position.x - other.position.x );
        var dy = Math.abs( this.position.y - other.position.y );
        
        return dx + dy - (Math.min(dx,dy)/2);
    },
};

function createCMapNode(options){
    var result = new CMapNode();
    options = options || {};
    result.position = jstonkers.utils.createVector2f(options.position);
    result.parent = options.parent;
    result.costFromStart = options.costFromStart || 0;
    result.estimatedCostToGoal = options.estimatedCostToGoal || 0;
    return result;
}


// Collision Map
// not for client use
jstonkers.model.CMap = Backbone.Model.extend({
    
    initialize: function() {
    },
    
    get : function(attr,y) {
        var data;
        if( _.isNumber(attr) ) {
            data = this.attributes.data;
            return data[ attr+(this.attributes.width*y) ];
        }
        return Backbone.Model.prototype.get.call(this, attr);
    },
    
    /**
    *   Takes a array of points and turns them an array of waypoints
    *   ie, [ [0,0],[1,0],[2,0],[3,0] ] becomes [ [0,0], [3,0] ]
    */
    rationalisePath: function( path ) {
        
        var i, n1, n2;
        var result = [];
        
        // convert the incoming array of points into vectors
        path = path.map( function(p){ return jstonkers.utils.createVector2f(p); });
        
        // add the first point
        result.push( path[0] );
        
        n1 = path[1].subR(path[0]).normalise();
        
        for( i=1;i<path.length-1;i++ ){
            
            // get the normal of the last point to the current
            n1 = path[i].subR(path[i-1]).normalise();
            // get the normal of the current point to the next
            n2 = path[i+1].subR(path[i]).normalise();
            
            if( !n1.isEqual(n2) ){
                result.push( path[i] );
            }
        }
        
        // add the last point
        result.push( path[path.length-1] );
        
        // return the array of vectors to points
        return result.map( function(p){ return p.toArray() });
    },
    
    /**
    *   Finds the best path from the start location to the target
    *   Returns an array of vectors describing the route.
    *
    *   
    */
    pathFind: function( start, target, options ){
        
        var self = this, currentNode, value, limit=80, count=0;
        var openList = jstonkers.utils.createPriorityQueue({allow_dupes:false,reverse:true});
        var closedList = jstonkers.utils.createPriorityQueue({allow_dupes:false});
        var path = [];
        var width = this.get('width'), height = this.get('height');
        
        options = options || {};
        target = jstonkers.utils.createVector2f(target);
        
        var neighbours = function( node ){
            var result = [];
            var pos = node.position;
            
            _.each([ 
                [pos.x-1,pos.y-1 ], [pos.x,pos.y-1],[pos.x+1,pos.y-1],
                [pos.x-1,pos.y], [pos.x+1,pos.y],
                [pos.x-1,pos.y+1],[pos.x,pos.y+1], [pos.x+1,pos.y+1] 
            ], function(p) {
                value = self.get(p[0],p[1]);
                if( options.onlytile && options.onlytile != value )
                    return;
                if( p[0] >= 0 && p[1] >= 0 && p[0] < width && p[1] < height) {
                    h = Math.abs(p[0]-target.x) +Math.abs(p[1]-target.y);
                    result.push( createCMapNode({position:p, estimatedCostToGoal:h, parent:node}) );
                }
            });
            
            return result;
        };
        
        startNode = createCMapNode({position:start});
        targetNode = createCMapNode({position:target});
        
        openList.push( startNode );
        
        while( count < limit && openList.length() > 0 ) {
            
            currentNode = openList.pop();
            
            
            // if currentNode is final, return the successful path
            if( currentNode.isEqual(targetNode) ) {
                
                while( currentNode.parent ) {
                    path.unshift( currentNode.position.toArray() );
                    currentNode = currentNode.parent;
                }
                path.unshift( startNode.position );
                
                return this.rationalisePath(path);
            }
            
            // push currentNode onto closedList and remove from openList
            closedList.push( currentNode );
            
            _.each( neighbours(currentNode), function(neighbour) {
                
                // log('   checking ' + neighbour.position);
                openExisting = openList.contains(neighbour);
                closedExisting = closedList.contains(neighbour);
                
                costFromStart = currentNode.costFromStart + neighbour.getCost();
                
                if( (!openExisting && !closedExisting) || costFromStart < neighbour.getCost() ){
                    neighbour.parent = currentNode;
                    
                    if( closedExisting ){
                        closedList.remove(neighbour);
                    }
                    
                    if( !openExisting ){
                        openList.push( neighbour, neighbour.getCost() )
                        // log( '  * added ' + neighbour.position + ' cost: ' + neighbour.getCost() );
                    }
                }
            });
            // log(inspect(openList.queue));
            // throw new Error('done');
            count++;
        };
    },
    
});

jstonkers.model.createCMap = function( options ) {
    var result = new jstonkers.model.CMap();
    
    if( options.data ) {
        // attempt to load the data
        if( path.existsSync(options.data) && fs.statSync(options.data).isFile() ){
            var fileData = fs.readFileSync( options.data );
            var ds = jstonkers.utils.createDataBuffer( fileData );
            
            assert.ok( ds.readString(4) == 'CMAP' );
            
            result.set({width: ds.readInt(), height: ds.readInt(), data: ds.readBytes()});
        }
    }
    
    return result;
};
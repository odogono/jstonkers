// Adds functions to map to allow paths to be plotted

var Vector2f = require('../vector2f');
var PriorityQueue = require('../priority_queue');
var Entity = require('./entity');
var Map = require('./map');

_.extend( Map.entity.prototype, {

    get: function(attr,y) {
        var data;
        if( _.isNumber(attr) ) {
            data = this.attributes._data;
            return data[ attr+(this.attributes.width*y) ];
        }
        return Entity.Entity.prototype.get.apply(this, arguments);
    },

    costOfIndex: function(index){
        var table = [
            // normal land
            0,
            // void
            10,
            // mountain
            5.5,
            // forest
            2,
            // water
            10,
            // base
            0
        ];
        if( index < 0 || index >= table.length )
            return 99;
        return table[index];
    },

    /**
    *   Finds the best path from the start location to the target
    *   Returns an array of vectors describing the route.
    *
    *   
    */
    findPath: function( start, target, options ){
        var self = this, currentNode, value, limit=80, count=0;
        var openList = PriorityQueue.create({allowDupes:false,reverse:true});
        var closedList = PriorityQueue.create({allowDupes:false});
        var path = [];
        var width = this.get('width'), height = this.get('height');
        var startTime = Date.now();
        
        options = options || {};
        target = Vector2f.create(target);
        
        var neighbours = function( node ){
            var result = [];
            var pos = node.position;
            
            _.each([
                [pos.x-1,pos.y-1 ], [pos.x,pos.y-1],[pos.x+1,pos.y-1],
                [pos.x-1,pos.y], [pos.x+1,pos.y],
                [pos.x-1,pos.y+1],[pos.x,pos.y+1], [pos.x+1,pos.y+1] 
            ], function(p) {
                value = self.get(p[0],p[1]);
                if( options.onlyTile && options.onlyTile !== value )
                    return;
                if( p[0] >= 0 && p[1] >= 0 && p[0] < width && p[1] < height) {

                    var h = Math.abs(p[0]-target[0]) + Math.abs(p[1]-target[1]);
                    // var h = Math.max(  Math.abs(p[0]-target.x), Math.abs(p[1]-target.y) );

                    var D = 1;

                    if( !options.onlyTile ) 
                        D = self.costOfIndex( value );

                    h += D;

                    // var hDiag = Math.min(  Math.abs(p[0]-target.x), Math.abs(p[1]-target.y) );
                    // var hStra = Math.abs(p[0]-target.x) + Math.abs(p[1]-target.y);
                    // var h = (D*2) * hDiag + D * (hStra) - (2*hDiag);


                    // if the proposed path lies off the direct line, then adjust
                    var dx1 = p[0] - target[0];
                    var dy1 = p[1] - target[1];
                    var dx2 = start[0] - target[0];
                    var dy2 = start[1] - target[1];
                    var cross = Math.abs(dx1*dy2 - dx2*dy1);
                    cross = cross * 0.001;
                    h += cross;

                    // log(pos + ' estimatedCostToGoal: ' + p + ' ' + h + ' ' + cross );
                    result.push( createMapPathNode({position:p, estimatedCostToGoal:h, parent:node}) );
                }
            });
            
            return result;
        };
        
        var startNode = createMapPathNode({position:start});
        var targetNode = createMapPathNode({position:target});
        
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
                
                if( options.debug ) log('* took ' + (Date.now()-startTime));
                return Map.simplifyPath(path);
            }
            
            // push currentNode onto closedList and remove from openList
            closedList.push( currentNode );
            
            _.each( neighbours(currentNode), function(neighbour) {
                
                // log('   checking ' + neighbour.position);
                var openExisting = openList.contains(neighbour);
                var closedExisting = closedList.contains(neighbour);
                
                var costFromStart = currentNode.costFromStart + neighbour.getCost();
                
                if( (!openExisting && !closedExisting) || costFromStart < neighbour.getCost() ){
                    neighbour.parent = currentNode;
                    
                    if( closedExisting ){
                        closedList.remove(neighbour);
                    }
                    
                    if( !openExisting ){
                        openList.push( neighbour, neighbour.getCost() )
                        // if( options.debug ) log( '  * added ' + neighbour.position + ' cost: ' + neighbour.getCost() );
                    }
                }
            });

            // if( options.debug ) log( '* count ' + count );
            count++;
        };


        // while( currentNode.parent ) {
        //     path.unshift( currentNode.position.toArray() );
        //     currentNode = currentNode.parent;
        // }
        // path.unshift( startNode.position );
        
        // return Map.simplifyPath(path);
    }
    
});



// Takes a array of points and turns them an array of waypoints
// ie, [ [0,0],[1,0],[2,0],[3,0] ] becomes [ [0,0], [3,0] ]
Map.simplifyPath = function( path ){
    var i, n1, n2;
    var result = [];
    
    // convert the incoming array of points into vectors
    var nPath = [];
    for( i in path ){
        nPath.push( Vector2f.create(path[i]) );
    }

    
    // add the first point
    result.push( nPath[0].toArray() );
    
    n1 = nPath[1].subR(nPath[0]).normalise();
    
    for( i=1;i<nPath.length-1;i++ ){
        
        // get the normal of the last point to the current
        n1 = nPath[i].subR(nPath[i-1]).normalise();
        // get the normal of the current point to the next
        n2 = nPath[i+1].subR(nPath[i]).normalise();
        
        if( !n1.isEqual(n2) ){
            result.push( nPath[i].toArray() );
        }
    }
    
    // add the last point
    result.push( nPath[nPath.length-1].toArray() );
    
    return result;
}



var MapPathNode = function(){};

MapPathNode.prototype = {
    isEqual: function(other) {
        return this.position.isEqual(other.position);
    },
    
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

var createMapPathNode = function(options){
    options = options || {};

    var result = new MapPathNode();
    
    result.position = Vector2f.create(options.position);
    result.parent = options.parent;
    result.costFromStart = options.costFromStart || 0;
    result.estimatedCostToGoal = options.estimatedCostToGoal || 0;
    
    return result;
}


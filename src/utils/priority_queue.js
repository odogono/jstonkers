
var PriorityQueue = function(){
    this.queue = [];
};

PriorityQueue.prototype = {
    
    defaultSort: function(a,b) {
        return b.priority - a.priority;
    },
    
    reverseSort: function(a,b) {
        return a.priority - b.priority;
    },
    
    pop: function() {
        var item = this.queue.shift();
        return item ? item.item : undefined;
    },
    
    push: function( item, priority ) {
        this.queue.push( {item:item, priority:priority} );
        this.queue.sort( this.sort );
    },
    
    peek: function() {
        var item = this.queue[0];
        return item ? item.item : undefined;
    },
    
    isEmpty: function() {
        return this.queue.length === 0
    },
    
    empty: function() {
        this.queue = [];
    },
    
    length: function() {
        return this.queue.length;
    }
};

exports.PriorityQueue = PriorityQueue;
exports.createPriorityQueue = function(options){
    var result = new PriorityQueue();
    
    options = options || {};
    
    // set default sort
    result.sort = options.sort || result.defaultSort;
    
    return result;
};
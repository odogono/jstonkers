
exports.PriorityQueue = PriorityQueue = function(){
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
        var existing;
        // if( !this.allowDupes ){
            if( existing = this.contains(item) ) {
                if( existing.priority !== priority ){
                    existing.priority = priority;
                    this.queue.sort( this.sort );
                    return;
                }
            }
        // }
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
    },
    
    contains: function( item ) {
        var result;
        
        this.queue.some( function(el){
            if( _.isEqual(el.item,item) ) {
                result = el;
                return true;
            }
        });
        return result;
    },
    
    select: function( selectFn ) {
        return _.map(_.select( this.queue, function(i){
            return selectFn( i.item );
        }), function(i){ return i.item });
    },
    
    remove: function( item ) {
        var index = -1;
        for( var i in this.queue ) {
            if( _.isEqual(item, this.queue[i].item ) ){
                index = i;
                break;
            }
        }
        if( index >= 0 )
            return this.queue.splice( index, 1 );
    },
};

exports.create = function(options){
    var result = new PriorityQueue();

    options = options || {};
    result.sort = options.sort || result.defaultSort;
    result.allowDupes = options.allowDupes;
    if( options.reverse )
        result.sort = result.reverseSort;
    
    return result;
};
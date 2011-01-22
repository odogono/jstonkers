var testCase = require('nodeunit').testCase,
    fs = require('fs'),
    log = require('util').log,
    inspect = require('util').inspect;

module.exports = testCase({
    setUp: function (callback) {
        this.queue = jstonkers.utils.createPriorityQueue();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testPush: function( test ) {        
        
        this.queue.push( 'first' );
        
        test.equal( this.queue.length(), 1 );
        test.ok( !this.queue.isEmpty() );
        
        test.done();
    },
    
    testPeek: function( test ) {
        
        this.queue.push( 'second', 2 );
        this.queue.push( 'first', 10 );
        
        test.equal( this.queue.peek(), 'first' );
        
        test.done();
    },
    
    testEmpty: function( test ) {
        
        this.queue.push( 'second', 2 );
        this.queue.push( 'first', 10 );
        
        test.equal( this.queue.length(), 2 );
        
        this.queue.empty();
        
        test.equal( this.queue.length(), 0 );
        test.ok( this.queue.isEmpty() );
        
        test.done();
    },
    
    
    testPop: function( test ) {
        
        this.queue.push( 'last', 13 );
        this.queue.push( 'first', 200 );
        this.queue.push( 'middle', 199 );
        
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'middle' );
        test.equal( this.queue.pop(), 'last' );
        
        test.done();
    },
    
    
    testNoPriorityPop: function( test ) {
        
        this.queue.push( 'last' );
        this.queue.push( 'first' );
        this.queue.push( 'middle' );
        
        test.equal( this.queue.pop(), 'last' );
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'middle' );
        
        test.done();
    },
    
    
    testSortLow: function( test ) {
        this.queue = jstonkers.utils.createPriorityQueue({sort:jstonkers.utils.PriorityQueue.prototype.reverseSort});
        
        this.queue.push( 'last', 100 );
        this.queue.push( 'first', 1 );
        this.queue.push( 'middle', 40 );
        
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'middle' );
        test.equal( this.queue.pop(), 'last' );
        
        
        this.queue = jstonkers.utils.createPriorityQueue({reverse:true});
        
        this.queue.push( 'last', 24 );
        this.queue.push( 'first', 48 );
        this.queue.push( 'middle', 12 );
        
        test.equal( this.queue.pop(), 'middle' );
        test.equal( this.queue.pop(), 'last' );
        test.equal( this.queue.pop(), 'first' );
        
        test.done();
    },
    
    
    
    testCustomSort: function( test ) {
        var sort = function(a,b) {
            return a.item.order - b.item.order;
        };
        
        var last = {name:'last',order:10};
        var middle = {name:'middle',order:5};
        var first = {name:'first',order:1};
        
        this.queue = jstonkers.utils.createPriorityQueue({sort:sort});
        
        this.queue.push( last );
        this.queue.push( middle );
        this.queue.push( first );
        
        test.equal( this.queue.pop(), first );
        test.equal( this.queue.pop(), middle );
        test.equal( this.queue.pop(), last );
        test.equal( this.queue.pop(), undefined );
        
        test.done();
    },
    
    testContains: function(test) {
        
        var value = {name:'middle', active:false};
        var value2 = {name:'middle', active:false};
        var value3 = {name:'middle', active:true};
        
        this.queue.push( 'last', 13 );
        this.queue.push( 'first', 200 );
        this.queue.push( value, 199 );
        
        test.ok( this.queue.contains('last') );
        test.ok( this.queue.contains('first') );
        test.ok( !this.queue.contains('middle') );
        test.ok( this.queue.contains(value) );
        test.ok( this.queue.contains(value2) );
        test.ok( !this.queue.contains(value3) );
        
        test.done();
        
    },
    
    
    /*testDuplicates: function(test) {
        
        this.queue = jstonkers.utils.createPriorityQueue({allow_dupes:true});
        
        this.queue.push( 'last', 40 );
        
        this.queue.push( 'first', 300 );
        this.queue.push( 'middle', 190 );
        this.queue.push( 'first', 300 );
        this.queue.push( 'middle', 190 );
        this.queue.push( 'last', 40 );
        
        log(inspect(this.queue));
        
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'middle' );
        test.equal( this.queue.pop(), 'middle' );
        test.equal( this.queue.pop(), 'last' );
        test.equal( this.queue.pop(), 'last' );
        
        test.ok( this.queue.isEmpty() );
        
        test.done();
    },//*/
    
    
    testMove: function(test) {
        
        this.queue.push( 'last', 40 );
        this.queue.push( 'first', 300 );
        this.queue.push( 'middle', 190 );
        
        this.queue.push( 'last', 301 );
        
        test.equal( this.queue.pop(), 'last' );
        test.equal( this.queue.pop(), 'first' );
        test.equal( this.queue.pop(), 'middle' );
        
        test.ok( this.queue.isEmpty() );
        
        test.done();
    },
    
    testSelect: function(test) {
        
        this.queue.push( {name:'first', time:60}, 20 );
        this.queue.push( {name:'middle', time:20}, 20 );
        this.queue.push( {name:'last', time:200}, 200 );
        
        test.equal( this.queue.select( function(item){
            return item.time === 20;
        })[0].name, 'middle' ); 
        
        test.equal( _.first(this.queue.select( function(item){
            return item.time === 220;
        })), undefined );
        
        test.done();
    },
    
    testRemove: function(test) {
        this.queue.push( {name:'first', time:60}, 20 );
        this.queue.push( {name:'middle', time:20}, 20 );
        this.queue.push( {name:'last', time:200}, 200 );
        
        test.equal( this.queue.length(), 3 );
        
        this.queue.remove( {name:'middle', time:20} );
        test.equal( this.queue.length(), 2 );
        
        test.equal( this.queue.remove( {name:'middle', time:20}), undefined );
        test.equal( this.queue.length(), 2 );
        
        test.done();
    },
    
    
});
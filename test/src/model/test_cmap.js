var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        var options = {
            data: 'var/maps/b.pix'
        };
        
        this.cmap = jstonkers.model.createCMap( options );
        
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testLoad: function(test) {
        
        test.equals( this.cmap.get('width'), 8 );
        test.equals( this.cmap.get('height'), 8 );
        test.equals( this.cmap.get('data').length, 64 );
        
        test.done();
    },
    
    testQuery: function(test) {
        // water
        test.equals( this.cmap.get(0,0), 4 );
        test.equals( this.cmap.get(7,7), 4 );
        
        // forest
        test.equals( this.cmap.get(2,2), 3 );
        test.equals( this.cmap.get(5,5), 3 );
        
        // base
        test.equals( this.cmap.get(5,2), 5 );
        
        // normal
        test.equals( this.cmap.get(3,1), 0 );
        
        test.done();
    },

    
    testRationalisePath: function(test) {
        
        var path;
        
        path = [
            [0,0],[0,1],
            [1,1],[2,1],
            [2,0],[1,0],
            [1,-1],[2,-1],[3,-1],[4,-1],
        ];
        
        test.deepEqual( this.cmap.rationalisePath(path), [ 
            [ 0, 0 ],
            [ 0, 1 ],
            [ 2, 1 ],
            [ 2, 0 ],
            [ 1, 0 ],
            [ 1, -1 ],
            [ 4, -1 ],
             ]);
            
        path = [
            [0,0], [1,1], [2,2], [3,3],
            [4,3], [5,3], [6,3], [7,3],
            [8,4], [9,5], [10,6], [11,7],
        ];
        
        test.deepEqual( this.cmap.rationalisePath(path), [ 
            [ 0, 0 ],
            [ 3, 3 ],
            [ 7, 3 ],
            [ 11, 7 ] ]);
        
        path = [
            [ 0,0 ],[ 1,1 ],[ 2,1 ],[ 3,0 ],[ 4,0 ],[ 5,1 ],[ 6,2 ],[ 7,3 ],[ 7,4 ],[ 7,5 ],[ 7,6 ], [ 7,7 ]
        ];
        
        test.deepEqual( this.cmap.rationalisePath(path), [ 
            [ 0, 0 ],
            [ 1, 1 ],
            [ 2, 1 ],
            [ 3, 0 ],
            [ 4, 0 ],
            [ 7, 3 ],
            [ 7, 7 ] ]);
        
        path = [
            [0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7]
        ];

        test.deepEqual( this.cmap.rationalisePath(path), [ [0,0], [7,7] ] );
        //*/
        test.done();
    },

    
    testPathFind: function(test) {
        
        var path;
        
        // a direct line, ignoring tiles
        test.deepEqual( this.cmap.pathFind( [0,0], [7,7] ),[
            [ 0, 0 ],
            [ 7, 7 ]
        ]);
        
        // a water based path find from the top left to the bottom right
        test.deepEqual( this.cmap.pathFind( [0,0], [7,7], {onlytile:4} ),[
            [ 0, 0 ],
             [ 1, 1 ],
             [ 2, 1 ],
             [ 3, 0 ],
             [ 4, 0 ],
             [ 7, 3 ],
             [ 7, 7 ]
        ] );
        
        test.done();
    },
});
require( '../src/common' );
require( '../src/main.server' );


describe('Map', function(){

    beforeEach( function(done){
        Common.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });



    describe('path operations', function(){

        it('should simplify a path', function(){

            // var statePath = Common.path.join( Common.paths.data, 'states', 'game_a.json' );
            // var game = Common.entity.Game.create(null,{statePath:statePath});

            var mapPath = Common.path.join( Common.paths.data, 'maps', 'b' );
            var map = Common.entity.Map.create(null,{mapPath:mapPath});

            var data = [
                {
                    path: [ [0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7] ]
                    expected: [ [0,0], [7,7] ];
                },
                { 
                    path: [ [0,0],[0,1], [1,1],[2,1], [2,0],[1,0], [1,-1],[2,-1],[3,-1],[4,-1] ],
                    expected:[ [ 0, 0 ], [ 0, 1 ], [ 2, 1 ], [ 2, 0 ], [ 1, 0 ], [ 1, -1 ], [ 4, -1 ]
                },
                {
                    path: [
                        [0,0], [1,1], [2,2], [3,3],
                        [4,3], [5,3], [6,3], [7,3],
                        [8,4], [9,5], [10,6], [11,7],
                    ],
                    expected: [ [ 0, 0 ], [ 3, 3 ], [ 7, 3 ], [ 11, 7 ] ]
                },
                {
                    path:[ [ 0,0 ],[ 1,1 ],[ 2,1 ],[ 3,0 ],[ 4,0 ],[ 5,1 ],[ 6,2 ],[ 7,3 ],[ 7,4 ],[ 7,5 ],[ 7,6 ], [ 7,7 ] ],
                    expected:[ [ 0, 0 ], [ 1, 1 ], [ 2, 1 ], [ 3, 0 ], [ 4, 0 ], [ 7, 3 ], [ 7, 7 ] ]
                }
            ];

            data.each( function(test){
                assert.deepEqual( map.simplifyPath(test.path), test.expected );
            });
    });
    

});
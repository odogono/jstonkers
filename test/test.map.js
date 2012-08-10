require( '../src/common' );
require( '../src/main.server' );


describe('Map', function(){

    after(function(){
        for (var key in Object.keys(require.cache)){ delete require.cache[key]; }
    });
    
    beforeEach( function(done){
        jstonkers.sync.clear( function(err){
            if( err ) return done(err);
            done();
        });
    });


    describe('map data', function(){

        it('should load', function(done){
            var dataPath = Common.path.join( Common.paths.data, 'maps', 'b.col.png' );
            var map = jstonkers.entity.Map.create();

            Step(
                function(){
                    map.loadData( dataPath, this );        
                },
                function(err,result){
                    if( err ) throw err;

                    assert.equal( map.get(0,0), 4 );
                    assert.equal( map.get(2,2), 3 );
                    assert.equal( map.get(3,3), 0 );
                    assert.equal( map.get(5,2), 5 );

                    done();
                }
            );
        });
    });


    describe('path operations', function(){

        it('should simplify a path', function(){
            var data = [
                {
                    path: [ [0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7] ],
                    expected: [ [0,0], [7,7] ]
                },
                { 
                    path: [ [0,0],[0,1], [1,1],[2,1], [2,0],[1,0], [1,-1],[2,-1],[3,-1],[4,-1] ],
                    expected:[ [0,0], [0,1], [2,1], [2,0], [1,0], [1,-1], [4, -1] ]
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

            _.each( data, function(test){
                assert.deepEqual( jstonkers.entity.Map.simplifyPath(test.path), test.expected );
            });
        });

        it('should find a path', function(done){
            var dataPath = Common.path.join( Common.paths.data, 'maps', 'b.col.png' );
            var map = jstonkers.entity.Map.create();

            Step(
                function(){
                    map.loadData( dataPath, this );        
                },
                function(err,result){
                    if( err ) throw err;

                    // a direct line, ignoring tiles
                    assert.deepEqual( map.findPath( [0,0], [7,7] ), [ [0,0],[7,7] ] );

                    // a water based path find from the top left to the bottom right
                    assert.deepEqual( map.findPath( [0,0], [7,7], {onlyTile:4} ),[
                        [ 0, 0 ], [ 1, 1 ], [ 2, 1 ], [ 3, 0 ], [ 4, 0 ], [ 7, 3 ], [ 7, 7 ]
                    ]);

                    // done();
                    // log('go');
                    // map.plotPath( [0,0], [7,7], {onlyTile:4}, this );
                    this();
                },
                function(){
                    done();
                }
            );
        });

    
        it('should choose the right path', function(done){
            var dataPath = Common.path.join( Common.paths.data, 'maps', 'c.col.png' );
            var map = jstonkers.entity.Map.create();

            Step(
                function(){
                    map.loadData( dataPath, this );
                },
                function(err,result){
                    if( err ) throw err;

                    // this();
                    assert.deepEqual( map.findPath( [0,0], [7,7], {onlyTile:4} ), [ [0,0],[1,1],[2,0],[5,0],[7,2],[7,7] ] );
                    // map.plotPath( [0,0], [7,7], {onlyTile:4, debug:true}, this );
                    // map.plotPath( [5,2], [5,5], {}, this );
                    this();
                },
                function(err){
                    if(err) throw err;
                    done();
                }
            );
        });//*/

        it('should choose the right path', function(done){
            var dataPath = Common.path.join( Common.paths.data, 'maps', 'a.col.png' );
            var map = jstonkers.entity.Map.create();

            Step(
                function(){
                    map.loadData( dataPath, this );
                },
                function(err,result){
                    if( err ) throw err;

                    // this();
                    // assert.deepEqual( map.findPath( [0,0], [7,7], {onlyTile:4} ), [ [0,0],[1,1],[2,0],[5,0],[7,2],[7,7] ] );
                    // map.plotPath( [0,0], [7,7], {onlyTile:4, debug:true}, this );
                    map.plotPath( [64,0], [12,13], {onlyTile:4, outputWidth:256,outputHeight:156}, this );
                    // this();
                },
                function(err){
                    if(err) throw err;
                    done();
                }
            );
        });
    });
    

});
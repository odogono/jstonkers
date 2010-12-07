
exports.testCreate = function(test) {
    test.expect(2);
    
    var team = new jstonkers.model.Team();
    
    team.bind('change:msg', function(team,msg){
        test.equal( msg, 'hi there'); 
    });
    
    team.set({msg:'hi there'});
    test.equals( team.get('msg'), 'hi there');
    
    test.done();
};

exports.testNormaliseDivisions = function(test){
    test.expect(5);
    
    // setting divisions as an array should cause the team
    // to normalise it into a DivisionList with stub objects
    var team = new jstonkers.model.Team();
    team.set({ divisions:[ 'tnk001', 'tnk002', 'tnk003' ]});
    var divisions = team.get('divisions');
    
    test.ok( !Array.isArray(divisions) );
    test.equal(divisions.get('tnk001').id, 'tnk001');
    test.ok(divisions.get('tnk001').get('stub') );
    test.equal(divisions.get('tnk002').id, 'tnk002');
    test.ok(divisions.get('tnk002').get('stub') );
    
    test.done();
}

exports.testToJSON = function(test){
    test.expect(1);
    
    var expected =  { divisions: [ 'tnk001', 'tnk002', 'tnk003' ], id: 'tea001' };
    var team = new jstonkers.model.Team();
    team.set({ id:'tea001', divisions:[ 'tnk001', 'tnk002', 'tnk003' ]});
    
    test.deepEqual( team.toJSON(), expected );
    
    test.done();
}


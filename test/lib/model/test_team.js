
exports.testCreateWithArgs = function(test) {
    log( inspect(jstonkers) );
    test.expect(1);
    var team = new jstonkers.model.Division();
    team.set({msg:'hi there'});
    test.equals( team.get('msg'), 'hi there');
    log( inspect(team) );
    test.done();
};

exports.testNormaliseDivisions = function(test){
    test.expect(3);
    
    var team = new jstonkers.model.Team();
    team.set({ divisions:[ 'tnk001', 'tnk002', 'tnk003' ]});
    var divisions = team.get('divisions');
    
    test.ok( !Array.isArray(divisions) );
    test.equal(divisions.get('tnk001').id, 'tnk001');
    test.ok(divisions.get('tnk001').get('stub') );
    
    test.done();
}
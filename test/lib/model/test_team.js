
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

exports.testNormaliseUnits = function(test){
    test.expect(5);
    
    // setting units as an array should cause the team
    // to normalise it into a UnitList with stub objects
    var team = new jstonkers.model.Team();
    team.set({ units:[ 'tnk001', 'tnk002', 'tnk003' ]});
    var units = team.get('units');
    
    test.ok( !Array.isArray(units) );
    test.equal(units.get('tnk001').id, 'tnk001');
    test.ok(units.get('tnk001').get('stub') );
    test.equal(units.get('tnk002').id, 'tnk002');
    test.ok(units.get('tnk002').get('stub') );
    
    test.done();
}

exports.testToJSON = function(test){
    test.expect(1);
    
    var expected =  { units: [ 'tnk001', 'tnk002', 'tnk003' ], id: 'tea001' };
    var team = new jstonkers.model.Team();
    team.set({ id:'tea001', units:[ 'tnk001', 'tnk002', 'tnk003' ]});
    
    test.deepEqual( team.toJSON(), expected );
    
    test.done();
}


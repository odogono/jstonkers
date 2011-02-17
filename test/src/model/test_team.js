var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        this.team = new jstonkers.model.Team();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testCreate: function(test) {
        test.expect(2);
    
        var team = new jstonkers.model.Team();
    
        team.bind('change:msg', function(team,msg){
            test.equal( msg, 'hi there'); 
        });
    
        team.set({msg:'hi there'});
        test.equals( team.get('msg'), 'hi there');
    
        test.done();
    },

    testNormaliseUnits: function(test){
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
    },
    
    testSetRealUnits: function(test) {
        
        var units = [ {id:'unit001', test:true}, {id:'unit002', test:true} ];
        
        this.team.set( {units:units} );
        
        var teamUnits = this.team.get('units');
        
        test.ok( !Array.isArray(teamUnits) );
        test.equal(teamUnits.get('unit001').id, 'unit001');
        test.equal(teamUnits.get('unit001').get('stub'), undefined );
        
        test.done();
    },

    testToJSON: function(test) {
        test.expect(1);
    
        var expected =  { units: [ 'tnk001', 'tnk002', 'tnk003' ], id: 'tea001' };
        var team = new jstonkers.model.Team();
        team.set({ id:'tea001', units:[ 'tnk001', 'tnk002', 'tnk003' ]});
    
        test.deepEqual( team.toJSON(), expected );
    
        test.done();
    },
    
    testAddUnit: function(test) {
        test.expect(3);
        
        var team = new jstonkers.model.Team({ id:'tea001' });
        var unit = new jstonkers.model.Unit({ id:'unt001', type:'example' });
        var expected =  { units: [ 'unt001' ], id: 'tea001' };
        
        team.add( unit );
        test.deepEqual( team.toJSON(), expected );
        
        test.equal( team.get('units').at(0).id, 'unt001' );
        test.equal( team.get('units').get('unt001').get('type'), 'example' );
        
        test.done();
    },

});
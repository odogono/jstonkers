var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        this.match = new jstonkers.model.Match();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testUnitReference: function(test) {
        this.match.set({ units:[{id:'unit1', type:'test'}] });
        var units = this.match.get('units');
        
        test.equal( units.length, 1 );
        test.ok( units.get('unit1') );
        
        test.equal( units.get('unit1').get('type'), 'test' );
        test.equal( units.get('unit1').get('match'), this.match );
        
        test.equal( JSON.stringify(units), '[{"id":"unit1","type":"test"}]' );
        test.done();
    },
    
    testChangeEvents: function(test) {
        test.expect( 2 );
        
        // mostly to test that the change event is received
        this.match.bind('change:units', function(units){
            test.equal( units.length, 2 );
        });
        
        this.match.bind('change:teams', function(teams){
            test.equal( teams.length, 1 ); 
        });
        
        this.match.set({ units:[{id:'unit1', type:'test'},{id:'unit2', type:'example'}] }, {debug:true});
        this.match.set({ teams:[{id:'team1', units:['unit1','unit2']}] }, {debug:true});
        
        test.done();
    },
    
    testTeamUnitResolving: function(test) {
        
        this.match.set({ units:[{id:'unit1', type:'test'},{id:'unit2', type:'example'}] }, {debug:true});
        this.match.set({ teams:[{id:'team1', units:['unit1','unit2']}] }, {debug:true});
        
        test.equal( this.match.get('units').length, 2 );
        test.equal( this.match.get('teams').length, 1 );
    
        var team = this.match.get('teams').get('team1');
        test.equal( team.get('match'), this.match );
        
        // team will have its own unit list
        var units = team.get('units');
        test.equal( units.length, 2 );
        
        test.ok( units.get('unit1') );
        test.ok( units.get('unit2') );
        
        // should not be stubbed, and should contain a reference to the team and match
        var unit = units.get('unit1');
    
        test.equal( unit.get('stub'), undefined );        
        test.equal( unit.get('team'), team );
        test.equal( unit.get('match'), this.match );
    
        test.done();
    },
    
    testTeamUnitResolvingMissing: function(test) {
        this.match.set({ units:[{id:'unit1', type:'test'}] }, {debug:true});
        this.match.set({ teams:[{id:'team1', units:['unit1','unit3']}] }, {debug:true});
        
        var team = this.match.get('teams').get('team1');
        var teamUnits = team.get('units');
        var matchUnits = this.match.get('units');
        
        // only one unit should be set on the team
        test.equal( teamUnits.length, 1 );
        
        test.equal( teamUnits.get('unit1').get('stub'), undefined );
        test.equal( teamUnits.get('unit3'), undefined );
        
        test.equal( matchUnits.get('unit1').get('team'), team );
        test.equal( matchUnits.get('unit1').get('match'), this.match );
        
        test.done();
    },
    
    testLoading: function(test) {
        var state = JSON.parse( fs.readFileSync( path.join( dir_var, 'test', 'match_state.json' ) ) );
        this.match.set( state );
        
        // log( inspect(this.match.toJSON(),false,null) );
        log( JSON.stringify( this.match ));
        // log( inspect(this.match.get('teams'),false,3) );
        var team = this.match.get('teams').get('tea001');
        // log( inspect( this.match.get('units').first() ) );
        // log( inspect(team.get('units').first()) );
        
        test.done();
    },
});
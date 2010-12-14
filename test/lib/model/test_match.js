var testCase = require('nodeunit').testCase;
var fs = require('fs');

module.exports = testCase({
    setUp: function (callback) {
        this.match = new jstonkers.model.Match();
        this.foo = 'bar';
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
    
    testTeamUnitResolving: function(test) {
        
        this.match.set({ units:[{id:'unit1', type:'test'},{id:'unit2', type:'example'}] }, {debug:true});
        this.match.set({ teams:[{id:'team1', units:['unit1','unit2']}] }, {debug:true});
        
        test.equal( this.match.get('units').length, 2 );
        test.equal( this.match.get('teams').length, 1 );
        // 
        var team = this.match.get('teams').get('team1');
        test.equal( team.get('match'), this.match );
        // log('OH HAI');
        // log(inspect(team));

        test.done();
    },
    
    testLoading: function(test) {
        var state = JSON.parse( fs.readFileSync( path.join( dir_var, 'test', 'match_state.json' ) ) );
        this.match.set( state );
        
        // log( inspect(this.match.toJSON(),false,null) );
        // log( inspect(this.match.get('teams'),false,3) );
        var team = this.match.get('teams').get('tea001');
        // log( inspect(team.get('units').first().toJSON()) );
        
        test.done();
    },
});
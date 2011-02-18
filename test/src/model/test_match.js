var testCase = require('nodeunit').testCase;
var fs = require('fs');

Object.prototype.getName = function() { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((this).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};

module.exports = testCase({
    setUp: function (callback) {
        this.match = new jstonkers.model.Match();
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testLoadFromJSON: function(test) {
        var data = {
            units:[
                { id:"unit001", type:"tank", postion:[10,5] },
                { id:"unit002", type:"supply", postion:[200,123] },
                { id:"unit003", type:"artillery", postion:[65,233] },
            ],
            teams:[
                { id:"team001", index:0, units:[ "unit001", "unit002"] }
            ],
            players:[
                { id:"plyr001", team:"team001" }
            ] 
        };
        
        this.match.set( this.match.parse( data ) );
        
// log( JSON.stringify(this.match) );
        test.equal( this.match.get('units').length, 3 );
        test.equal( this.match.get('teams').length, 1 );
        test.equal( this.match.get('players').length, 1 );
        // log('Z refreshing UNITS ' + (this.match.get('units') instanceof jstonkers.model.UnitList) + ' ' + _.isArray(this.match.get('units')) + ' ' + this.match.get('units'));
        test.equal( this.match.get('teams').at(0).id, 'team001');
        test.equal( this.match.get('teams').at(0).get('units').length, 2 );
        team = this.match.get('teams').at(0);
        // log( "TEAM ? " + (team instanceof jstonkers.model.Team) )
        // console.log( inspect(team) );
        unit = team.get('units').get('unit001');
        test.equal( unit.get('type'), 'tank' );
        
        
        test.done();
    },
    
   testChangeEvents: function(test) {
        var data = {
            units:[
                {id:'unit1', type:'test'},{id:'unit2', type:'example'}
            ],
            teams:[
                {id:'team1', units:['unit1','unit2']}
            ],
        };
        test.expect( 2 );
        
        // mostly to test that the change event is received
        this.match.bind('change:units', function(units){
            test.equal( units.length, 2 );
        });
        
        this.match.bind('change:teams', function(teams){
            test.equal( teams.length, 1 ); 
        });
        
        this.match.set( this.match.parse( data ) );
        // this.match.set({ units:[{id:'unit1', type:'test'},{id:'unit2', type:'example'}] }, {debug:true});
        // this.match.set({ teams:[{id:'team1', units:['unit1','unit2']}] }, {debug:true});
        
        test.done();
    },
    
    
    testSetMultiple: function( test ) {
        var data = {
            units:[
                {id:'unit1', type:'test'},{id:'unit2', type:'example'}
            ],
            teams:[
                {id:'team1', units:['unit1','unit2']}
            ],
        };
        
        this.match.set( this.match.parse( data ) );
        
        test.equal( this.match.get('units').length, 2 );
        test.equal( this.match.get('units').get('unit1').get('type'), 'test');
        
        data = {
            units:[
                {id:'unit1', type:'example'},{id:'unit2', type:'test'}
            ],
            teams:[
                {id:'team1', units:['unit1','unit2']}
            ],
        };
        this.match.set( this.match.parse( data ) );
        
        test.equal( this.match.get('units').length, 2 );
        test.equal( this.match.get('units').get('unit1').get('type'), 'example');
        
        test.done();
    },
    
    
    testTeamUnitResolving: function(test) {
        var data = {
            units:[
                {id:'unit1', type:'test'},{id:'unit2', type:'example'}
            ],
            teams:[
                {id:'team1', units:['unit1','unit2']}
            ],
        };
        this.match.set( this.match.parse( data ) );
        
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

        test.equal( unit.get('team'), team );
        test.equal( unit.get('match'), this.match );
    
        test.done();
    },//*/
    
    
    testUnitChange: function(test) {
        var data = {
            units:[
                {id:'unit1', type:'tank',position:[10,0]},{id:'unit2', type:'supply', position:[8,2] }
            ],
            teams:[
                {id:'team1', units:['unit1','unit2']}
            ],
        };
        
        // this.match.bind('all', function(evt){
        //    log('received event ' + evt + ' from ' + this.id ); 
        // });
        // this.match.get('units').bind('all', function(evt){
        //    log('received units event ' + evt + ' from ' + this.id ); 
        // });
        
        this.match.set( this.match.parse( data ) );
        var unit1 = this.match.get('units').get('unit1');
        
        test.equal( this.match.get('teams').at(0).get('units').length, 2);
        test.equal( this.match.get('teams').at(0).get('units').at(0).get('type'), 'tank');
        test.equal( JSON.stringify(this.match.get('teams').at(0).get('units').at(0).get('position')), JSON.stringify([10,0]));
        test.equal( JSON.stringify(this.match.get('teams').at(0).get('units').at(1).get('position')), JSON.stringify([8,2]));
        
        
        var update_data = {
            units:[
                {id:'unit1', position:[12,10] }, {id:'unit2', position:[30,0], velocity:[2,1] }
            ]
        };
        
        // this.match.get('units').at(1).bind('all', function(evt){
        //    log('received unit event ' + evt + ' from ' + this.id ); 
        // });
        
        // the updated data should not displace existing
        // log('updating:');
        this.match.set( this.match.parse( update_data ), {update:true} );
        test.equal( this.match.get('teams').at(0).get('units').length, 2);
        test.equal( this.match.get('teams').at(0).get('units').at(0).get('type'), 'tank');
        test.equal( JSON.stringify(this.match.get('teams').at(0).get('units').at(0).get('position')), JSON.stringify([12,10]));
        test.equal( JSON.stringify(this.match.get('teams').at(0).get('units').at(1).get('position')), JSON.stringify([30,0]));
        test.equal( JSON.stringify(this.match.get('teams').at(0).get('units').at(1).get('velocity')), JSON.stringify([2,1]));

        // log( this.match.get('units').at(0).changedAttributes() );
        // test.ok( this.match.get('units').at(0).hasChanged() );
        // test.ok( this.match.get('units').at(1).hasChanged() );
        // test.ok( this.match.get('units').at(1).hasChanged() );
        
        // log( inspect(unit1.previousAttributes()) );
        // log( JSON.stringify(this.match));
        test.done();
    },
    
    testLoading: function(test) {
        var state = JSON.parse( fs.readFileSync( path.join( app_paths.var, 'test', 'match_state.json' ) ) );
        this.match.set( this.match.parse(state) );
        
        // log( inspect(this.match.toJSON(),false,null) );
        // log( JSON.stringify( this.match ));
        // log( inspect(this.match.get('teams'),false,3) );
        var team = this.match.get('teams').get('tea001');
        // log( inspect( this.match.get('units').first() ) );
        // log( inspect(team.get('units').first()) );
        
        test.done();
    },
});
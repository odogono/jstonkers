var testCase = require('nodeunit').testCase;
var fs = require('fs');

var testModel = Backbone.Model.extend({
});

module.exports = testCase({
    setUp: function (callback) {
        callback();
    },
    
    tearDown: function (callback) {
        // clean up
        callback();
    },
    
    testCreate: function(test) {
        
        // var fileStorage = jstonkers.storage.FileStorage.create({path:'var/storage'});
        var model = new testModel({ id:'ma', name:'model a', type:'partial'});
        
        // log( inspect(jstonkers) );
        model.save();
        
        model.set({status:'alive'});
        
        var loaded = new testModel({ id:'ma'});
        loaded.fetch();
        
        test.equal( loaded.get('name'), model.get('name') );
        test.equal( loaded.get('type'), model.get('type') );
        test.equal( model.get('status'), 'alive' );
        test.equal( loaded.get('status'), undefined );
        
        loaded.destroy();
        
        test.done();
    },
    
    
    
});
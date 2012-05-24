// log('this is exports');
// print_ins(exports);
// var exports = module.exports; 
// exports = require('./entity');

// _.extend(exports, require('./entity') );
module.exports = require('./entity');
_.extend(module.exports, require('./entity_relationship') );
// _.extend(module.exports, exports.entities);

// print_ins(module.exports);
// base entity class
// exports.Entity = exports.Entity;

module.exports.EntityCollection = require('./entity_collection').EntityCollection;
module.exports.createEntityCollection = require('./entity_collection').create;

// general creation function
// exports.create = module.exports.entity.create;

module.exports.Factory = require('./factory');
module.exports.toJSON = module.exports.Factory.toJSON;
module.exports.createFromJSON = module.exports.Factory.createFromJSON;

// merge in the erm functions into this namespace
// var erFuncs = require('./entity_relationship')
// _.extend(module.exports, erFuncs );






//  set up and register entity types
// _.each( exports.entities, function(entity,name){
//     registerEntityType( entity );
// });

// run post module initialisation entity relationship setup
// TODO : must be a better way
// _.each( exports.entities, function(entity,name){
//     erFuncs.initEntityER(entity, {debug:false});
// });
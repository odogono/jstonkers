
module.exports = require('./entity');

module.exports.EntityCollection = require('./entity_collection').EntityCollection;

_.extend(module.exports, require('./entity_relationship') );
// _.extend(module.exports, require('./entity_server') );


// module.exports.createEntityCollection = require('./entity_collection').create;
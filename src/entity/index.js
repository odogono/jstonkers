
module.exports = require('./entity');
_.extend(module.exports, require('./entity_relationship') );
// _.extend(module.exports, require('./entity_server') );

module.exports.EntityCollection = require('./entity_collection').EntityCollection;
module.exports.createEntityCollection = require('./entity_collection').create;
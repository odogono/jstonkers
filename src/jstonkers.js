/**
 * Export sub-modules.
 */



/**
*   Provide a means for hosting the Backbone classes within the commonjs environment
*   - not a great solution, but works for now
*/
exports.jstonkers = jstonkers = { controllers:{}, model:{}, app:{}, view:{}, ui:{} };
require('./model/sprite');
require('./model/unit');
require('./model/team');
require('./model/player');
require('./model/match');
jstonkers.utils = require('./utils');
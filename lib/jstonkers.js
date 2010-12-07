/**
 * Export sub-modules.
 */

exports.utils = require('./utils');

/**
*   Provide a means for hosting the Backbone classes within the commonjs environment
*   - not a great solution, but works for now
*/
exports.jstonkers = jstonkers = { controllers:{}, model:{}, app:{}, view:{}, ui:{} };
require('./model/sprite');
require('./model/division');
require('./model/team');

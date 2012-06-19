var Entity = require('../entity/entity');
// register all command entities in this dir

// log('commands in ' + __dirname );// module.filename );

// register all found entities
require('fs').readdirSync(__dirname).forEach(function(file) {
    if (file == "index.js") return;
    var name = file.substr(0, file.indexOf('.'));
    var cmd = require('./' + name);
    if( !cmd.isDisabled )
        Entity.registerEntity( cmd );
});
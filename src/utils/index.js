// module.exports = {
//     'Vector2f': require('./vector2f'),
//     'SocketIOClient': require('./socketio_client'),
//     'DataBuffer':require('./data_buffer'),
//     'PriorityQueue':require('./priority_queue'),
// };

// require('./vector2f');
// require('./socketio_client');
// require('./data_buffer');
// require('./priority_queue');

var utils = [
    require('./vector2f'),
    require('./socketio_client'),
    require('./data_buffer'),
    require('./priority_queue'),
];

for( i in utils ){
    for( attr in utils[i] ) {
        exports[attr] = utils[i][attr];
    }
}
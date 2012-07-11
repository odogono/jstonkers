jstonkers = window.jstonkers || { util:{}, model:{}, collection:{}, view:{}, controller:{} };
// Common = {};

jstonkers.Status = {
    ACTIVE: 'atv',
    INACTIVE: 'iat',
    DISABLED: 'dis',
    LOGICALLY_DELETED: 'ldl',
};

jstonkers.Vector2f = require('./vector2f');
jstonkers.PriorityQueue = require('./priority_queue');

jstonkers.entity = require('./entity/entity');
jstonkers.entity.EntityCollection = require('./entity/entity_collection').EntityCollection;
jstonkers.entity.createCollection = require('./entity/entity_collection').create;
_.extend(jstonkers.entity, require('./entity/entity_relationship') );


// jstonkers.entity.CommandQueue = require('./command_queue');

jstonkers.entity.registerEntity( _.extend({type:'unit'}, require('./entity/unit')) );
jstonkers.entity.registerEntity( _.extend({type:'map'}, require('./entity/map')) );
require('./entity/map.path_finding');

jstonkers.entity.registerEntity( _.extend({type:'team'}, require('./entity/team')) );
jstonkers.entity.registerEntity( _.extend({type:'game'}, require('./entity/game')) );
jstonkers.entity.registerEntity( _.extend({type:'user'}, require('./entity/user')) );


jstonkers.eventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
jstonkers.eventBus.bind( 'all', function(){
    console.log(arguments);
});
jstonkers.eventBus.emit = jstonkers.eventBus.trigger;


jstonkers.sprites = {
    offsets:[
        [
            [ 0,0 ],
            [ 0, 0 ],
            [ 0, 0 ]
        ],
        [
            [ 32, 0 ],
            [ 64, 0 ],
            [ 128, 0 ]
        ]
    ],
    uvs:[
        {
            tank:[ 0,0,16,8],
            supply:[ 0, 8, 16, 8],
            artillery:[ 0, 16, 16, 8],
            ship:[ 0, 24, 16, 8],
            infantry:[ 0, 32, 8, 16 ],
            disbanded:[ 0, 48, 8, 8 ],
            cursor: [16, 48, 8, 8],
            cursor_tank:[0,56,8,8],
            cursor_artillery:[8,56,8,8],
            cursor_infantry:[16,56,8,8],
            cursor_supply:[24,56,8,8],
        },
        {
            tank:[ 0,0,32,16], 
            supply:[ 0, 16, 32,16],
            artillery:[ 0, 32, 32,16],
            ship:[ 0, 48, 32,16],
            infantry:[ 0, 64, 16, 32 ],
            disbanded:[ 0, 96, 16, 16 ],
            cursor: [16, 96, 16, 16],
            cursor_tank:[0,112,16,16],
            cursor_artillery:[16,112,16,16],
            cursor_infantry:[32,112,16,16],
            cursor_supply:[48,112,16,16],
        },
        {
            tank:[ 0,0,64,32], 
            supply:[ 0, 32, 64,32],
            artillery:[ 0, 64, 64,32],
            ship:[ 0, 96, 64,32],
            infantry:[ 0, 128, 32, 64 ],
            disbanded:[ 0, 192, 32, 32 ],
            cursor: [32, 192, 32, 32],
            cursor_tank:[0,224,32,32],
            cursor_artillery:[32,224,32,32],
            cursor_infantry:[64,224,32,32],
            cursor_supply:[96,224,32,32],
        }
    ]
};

$(function() {
    log('hello there');

    /*var socket = io.connect('http://localhost/');
    socket.on('connect', function () {
        socket.send('hi');
        socket.on('message', function (msg) {
            console.log('received ' + JSON.stringify(msg));
            console.log( msg );
        });
    });//*/
});
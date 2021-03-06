JSTC = {};
jstonkers = {};
jstonkers.client = jstonkers.client || {util:{}, model:{}, collection:{}, view:{ games:{} }};

jstonkers.Status = {
    ACTIVE: 'atv',
    INACTIVE: 'iat',
    DISABLED: 'dis',
    LOGICALLY_DELETED: 'ldl',
};

require('./client/utils');

var log = debug('client:main');

var client = _.extend( jstonkers.client, {
    Vector2f: require('./vector2f'),
    PriorityQueue: require('./priority_queue'),
    entity: require('./entity/entity'),
});


JSTC.events = jstonkers.eventBus = _.extend({}, Backbone.Events,{cid : 'eventBus'});
// jstonkers.eventBus.bind( 'all', function(){
    // console.log( JSON.stringify(arguments) );
// });
jstonkers.eventBus.emit = jstonkers.eventBus.trigger;

JSTC.EntityCollection = require('./entity/entity_collection').EntityCollection;

_.extend( client.entity, {
    EntityCollection: JSTC.EntityCollection,
    createCollection: require('./entity/entity_collection').create,
});

var entity = _.extend( client.entity, require('./entity/entity_relationship') );


entity.registerEntity( require('./entity/unit') );
require('./entity/unit.steering');
entity.registerEntity( require('./entity/unit_tank') );
entity.registerEntity( require('./entity/unit_ship') );
entity.registerEntity( require('./entity/unit_supply') );

entity.registerEntity( require('./entity/map') );
require('./entity/map.path_finding')( entity.Map );

entity.registerEntity( require('./entity/team') );
entity.registerEntity( require('./entity/game') );
entity.registerEntity( require('./entity/user') );


client.sprites = {
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

jstonkers.client.BitmapFontCanvas = require('./bitmap_font_canvas');

require('./client/models');
require('./client/baseview');
require('./client/server_comms');
require('./client/app');

require('./client/view.ticker');
require('./client/view.games.all');
require('./client/view.games.preview');
require('./client/view.games.view');
require('./client/view.home');
require('./client/view.map');
require('./client/view.global');

$(function() {
    // log('hello there');

    /*var socket = io.connect('http://localhost/');
    socket.on('connect', function () {
        socket.send('hi');
        socket.on('message', function (msg) {
            console.log('received ' + JSON.stringify(msg));
            console.log( msg );
        });
    });//*/
});
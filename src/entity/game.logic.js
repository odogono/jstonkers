var game = require('./game');

_.extend( game.entity.prototype, {

    onStart: function(){
        log('game has started');
    }

});
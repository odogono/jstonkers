

/**
 * A GameChannel represents the communication link between a Game and its observers
 *
 * It may contain one or more UserChannels which have an interest in sending and receiving
 * events from a game
 */


var GameChannel = exports.GameChannel = function(){

}

exports.create = function(game, options){
    var result = new GameChannel();
    // result.game

    return result;
}
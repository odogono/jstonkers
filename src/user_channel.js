

/**
 * A User Channel represents a connected User in the system
 * It contains one or more socket.io clients all grouped by a user id
 */

var UserChannel = exports.UserChannel = function(){
}




exports.create = function(options){
    var result = new UserChannel();
    return result;   
}
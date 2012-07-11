var User = require( Common.path.join(Common.paths.entities,'user') );


// 
// Loads a User from the session information
// 
exports.load = function(req, res, next){
    if( req.session.uid ){
        User.create({id:req.session.uid}).fetchCB( function(err,user){
            log('retrieved existing user from session uid ' + user.id);
            req.user = user;
            next();
        });
    }
    else {
        // load user based on session id
        User.retrieveBySessionId( req.sessionID, function(err, user){
            if(user){
                log('retrieved user from session id ' + user.id);
                req.user = user;
            }
            next();
        });
    }
};

// 
// If a User is missing from the request object, a new user is created
// 
exports.createIfMissing = function(req,res,next){
    if( !req.user ){
        User.create( {sid:req.sessionID} ).saveCB( function(err, result){
            req.user = result;
            req.session.uid = result.id;
            log('created new user ' + result.id);
            next();
        });
    } else
        next();
}
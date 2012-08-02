// 
// Route handling middleware for dealing with Users
// 
var User = require( Common.path.join(Common.paths.entities,'user') );


// 
// Loads a User from the session information
// 
exports.load = function(req, res, next){
    // load by user id
    if( req.session.userId ){
        User.create({id:req.session.userId}).fetchCB( function(err,user){
            log('retrieved existing user from session userId ' + user.id);
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
exports.create = function(req,res,next){
    if( !req.user ){
        var params = {sid:req.sessionID, siotoken:uuid.v4() };
        User.create( params ).saveCB( function(err, result){
            req.user = result;
            req.session.userId = result.id;
            req.siotoken = result.get('siotoken');
            log('created new user ' + result.id);
            next();
        });
    } else
        next();
}

var establishSioToken = function( session, cb ){
    if( !session.siotoken ){
        jstonkers.sync.createSioTokenForSession( session.id, function(err,siotoken){
            session.siotoken = siotoken;
            cb( null, siotoken );
        });
    } else
        cb( null, session.siotoken );
}

// 
// 
// 
exports.loadOrCreate = function(req,res,next){
    var session = req.session;

    establishSioToken( session, function(err, siotoken){
        if( err ) throw err;

        // set the token as a response header
        req.siotoken = siotoken;
        res.set('siotoken', siotoken );

        // load by user id
        if( req.session.userId ){
            User.create({id:req.session.userId}).fetchCB( function(err,user){
                log('retrieved existing user from session userId ' + user.id);
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
                    req.session.userId = user.id;
                    next();
                }
                else {
                    var params = {sid:req.sessionID};
                    User.create( params ).saveCB( function(err, result){
                        log('created new user ' + result.id);
                        next();
                    });
                }
            });
        }
    });

    
    
}
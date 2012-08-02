var connectUtils = require('express/node_modules/connect').utils;

// provide simple setting of cookies from a response object
var Request = require('supertest/node_modules/superagent').Request;
Request.prototype.setCookies = function(res){
    var self = this;
    if( res && res.headers ){
        res.headers['set-cookie'].forEach( function(cookie){
            self.set('Cookie', cookie);
        });
    }
    return this;
}

var Cookie = require('express/node_modules/cookie');
exports.parseCookies = function(res,secret){
    var i, headers, cookie, key, value;
    var result = [];
    var cookies = (res && res.headers && res.headers['set-cookie']) ? res.headers['set-cookie'] : null;
    if( cookies ){
        for( i in cookies ){
            cookie = Cookie.parse( cookies[i] );
            if( secret ){
                for( key in cookie ){
                    cookie[key] = connectUtils.parseSignedCookie( cookie[key], secret );
                }
            }
            result.push( cookie );
        }
    }
    return result;
}
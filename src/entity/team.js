var entity = require('./entity');
// exports.schema = 'urn:schemas-opendoorgonorth:jstonkers:entity#team';
exports.type = 'team';

exports.ER = [
    { oneToMany:"unit", name:"units" },
    { oneToOne:'user' }
];

exports.entity = entity.Entity.extend({
    // defaults:function(){
    //     return _.defaults({
    //         'team_type': 'ai'
    //     }, entity.Entity.prototype.defaults );
    // },

    initialize: function(){
    },

    setUser: function( user ){
        var result = this.set({user:user});
        // user.trigger('game:joined', this, user);
        return result;
    },

    isAI: function(){
        return !this.get('user');
    }

});
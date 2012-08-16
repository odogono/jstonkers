var log = debug('client:app:models');
var Entity = jstonkers.client.entity;

jstonkers.client.model.App = Backbone.Model.extend({
    url: function(){
        var active = this.get('active');
        var urls = this.get('url');
        // console.log(urls);
        // log('returning url for ' + this.get('active') + ' ' + urls[active] );
        if( active == 'games.view' ){
            log('going to ' + urls[active] + '/' + this.get('game_id') );
            return urls[active] + '/' + this.get('game_id');
        }
        return urls[active];
    },

    parse: function(resp, xhr) {
        // log('parsing:');
        console.log( resp );

        if( resp.user ){
            resp.user = Entity.create(Entity.TYPE_USER, resp.user);
        }

        if( resp.game ){
            var gameId = resp.game.id;
            // log('parsing ' + gameId );
            resp.game = Entity.create(Entity.TYPE_GAME, gameId);
            // log('BEGIN');
            var parsed = resp.game.parse( resp.entities, null, {parseFor:gameId} );
            resp.game.set( parsed );
            // log('END ' + JSON.stringify(resp.game));
        }

        return resp;
    }
});
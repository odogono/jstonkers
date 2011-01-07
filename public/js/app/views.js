// jstonkers.view.Sprite = Backbone.View.extend({
//     
// });

jstonkers.view.Unit = Backbone.View.extend({
    
    className: 'sprite unit',
    
    events:{
        'mousedown': 'onTouchDown',
    },
    
    
    initialize: function() {
        var self = this;
        var type = this.model.get('type');
        this.model.view = this;
        this.view = this.options.view;
        this.zoom = this.view.zoom;
        this.uvs = this.view.spriteData.uvs[ this.view.zoom-1 ][type];
        
        _.bindAll(this, 'render', 'updatePosition');
        
        // listen to changes in the models position and update our own
        this.model.bind('change:position', this.updatePosition);
        
        // this.view.bind('cursor', this.onTouchMove);
        $(document).bind('mousemove', function(e){
            if( self.touchDown ){
                self.onTouchMove(e);
            }
            return true;
        });
        
        $(document).mouseup(function(e) {
            if( self.touchDown ){
                self.touchDown = false;
                $(self.el).removeClass('selected');
            }
        });
    },
    
    render: function() {
        if( this.view.invalid ){
            return this;
        }
        var type = this.model.get('type');
        var team = this.model.get('team');
        
        $(this.el).addClass( type );
        
        // its necessary to remove the previous zoom class since this 
        // function modifies not creates
        $(this.el).removeClass('zoom_' + this.zoom).addClass( 'zoom_' + this.view.zoom );
        this.zoom = this.view.zoom;
        
        // offset depends on the team - we use the attribute index to select the right set
        this.offset = this.view.spriteData.offsets[ team.get('index') ][ this.zoom-1 ];
        this.uvs = this.view.spriteData.uvs[ this.zoom-1 ][type];

        this.el.style.backgroundPosition = -(this.uvs[0]+this.offset[0]) + 'px ' + -(this.uvs[1]+this.offset[1]) + 'px';
        this.el.style.width = this.uvs[2];
        this.el.style.height = this.uvs[3];
        
        this.updatePosition();
        
        return this;
    },
    
    updateModel: function(model){
    },
    
    updatePosition: function(model,model_position) {
        var position = model_position || this.model.get('position');
        var mul = this.view.mul;
        var bounds = this.view.window;
        var x = (position[0]/mul[0]) - bounds[0];
        var y = (position[1]/mul[1]) - bounds[1];
        
        x -= (this.uvs[2]/2);
        y -= (this.uvs[3]/2);

        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
    },

    
    onTouchDown: function(evt){
        this.touchDown = true;
        $(this.el).addClass('selected');
        return false;
    },
    
    onTouchMove: function(evt){
        if( this.touchDown ) {
            // note - cursorWorld doesnt get set because this element consumes the event
            // this.model.set({position:this.view.cursorWorld});
            this.model.set({position:this.view.convertPosition( [evt.pageX, evt.pageY] ) });
        }
        return false;
    },
    
    onTouchUp: function(){
      
    },
});



jstonkers.view.MatchView = jstonkers.view.MapView.extend({
    
    initialize: function() {
        var self = this;
        _.bindAll(this, 'add', 'addAll');

        $.template( 'template-map_unit', $('#template-map_unit') );
        
        this.collection = new jstonkers.model.UnitList();
        this.collection.bind('add', this.addOne);
        this.collection.bind('refresh', this.addAll);
        
        this.spriteData = window.sprite_data;
        
        this.model.bind('change:teams', function(teams){
            self.model.get('units').each( self.add );
           // units.each( self.add );
           // console.log(units);
        });
        
        this.initialiseCollision();
        
        jstonkers.view.MapView.prototype.initialize.call(this, this.options);
        
    },
    
    render: function() {
        jstonkers.view.MapView.prototype.render.call(this);
        // this.collection.each( this.add );
        this.model.get('units').each( this.add );
    },
    
    initialiseCollision: function() {
        var self = this;
        
        // create the two collision views which return colour values from a given
        // position in the image bitmap. this is used to determine a single collision
        // value for a position within the world, ie to show water or mountain terrain
        
        // this isn't a traditional view - it could almost be a model...
        this.collisionView = new jstonkers.view.CollisionView({
            id:'collision_map',
            el:this.options.collision_map
        });
        
        // bind the movement of the cursor
        this.bind('cursor', function(wx,wy,ex,ey) {
            var val = this.getCollisionFromWorldPosition( wx,wy );
            $('#debug_tile').html( 'tile: ' + this.cursorTilePos[0] + ", " + this.cursorTilePos[1] + ' ' + val );
        });
    },
    
    // returns a collision value for the given world position
    // the value is an index into the collision index image
    getCollisionFromWorldPosition: function(wx,wy){
        var bounds, pos, val;
        if( !this.tileValues ){
            bounds = this.model.get('bounds');
            this.tileValues = this.collisionView.getIndexValues();
            this.tileMul = [ bounds[2] / this.collisionView.width, bounds[3] / this.collisionView.height ];
        }

        this.cursorTilePos = [  (wx / this.tileMul[0]) | 0, (wy / this.tileMul[1]) | 0 ];
        val = this.collisionView.getValue( this.cursorTilePos[0], this.cursorTilePos[1] );
        return this.tileValues.indexOf( val );// self.collisionIndex.getIndex( val );
    },
    
    
    add: function(model){
        var position = model.get('position');
        
        var unitView = new jstonkers.view.Unit({
            id: 'v' + model.get('id'), 
            model: model, 
            map: this,
            view: this,
        });
        
        $(this.el).append(unitView.render().el);
        
        // make sure the sprite is updated when the map is moved (screen pos)
        this.bind('move', unitView.updatePosition);
    },
    
    addAll: function(){
        this.collection.each(this.add);
    },

});

/**
* Used to encapsulate the maps collision data
*/
jstonkers.view.CollisionView = Backbone.View.extend({
    initialize: function() {
        // console.log( this.el );
        var self = this;
        this.canvas = $(this.el).find('canvas')[0];
        this.img = $(this.el).find('img')[0];
        
        
        this.width = parseInt($(this.img).attr('width'));
        this.height = parseInt($(this.img).attr('height'))-1;
        this.canvas.width = this.width;
        this.canvas.height = this.height+1;
        
        this.isRendered = false;
        
        // make sure the related image is loaded before we
        // render/analyse it
        // this.img.onload = function(){
        //     self.render();
        // }
    },
    
    update: function() {
        // console.log( $(this.el) );
        
        this.context = this.canvas.getContext("2d");
        this.context.drawImage( this.img, 0, 0, this.canvas.width, this.canvas.height );
        
        this.imageData = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
        this.isRendered = true;
        
        return this;
    },
    
    getValue: function(x,y) {
        if( !this.isRendered )
            this.update();
        var index = (x + ((y+1) * this.canvas.width)) * 4;
        var vals = [ this.imageData.data[index], this.imageData.data[index+1], this.imageData.data[index+2], this.imageData.data[index+3] ];
        var rgba = ((vals[0]&0xFF)<<24) | 
                    ((vals[1]&0xFF)<<16) | 
                    ((vals[2]&0xFF)<<8)
                    | ((vals[3]&0xFF)<<0);
        if (rgba < 0)
            rgba = 0xFFFFFFFF + rgba + 1;
        var result = rgba.toString(16);
        if (result.length < 8) {
            result = ('0000000000' + result).slice(-8);
        }
        return result;
    },
    
    getIndexValues: function(max) {
        var x,result = [];
        max = max || Math.min(8,this.canvas.width);
        if( !this.isRendered )
            this.render();
        
        for( x=0;x<max;x++ ){
            result.push( this.getValue(x,-1) );
        }
        
        return result;
    }
    
});
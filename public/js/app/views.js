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
        
        jstonkers.view.MapView.prototype.initialize.call(this, this.options);
    },
    
    render: function() {
        jstonkers.view.MapView.prototype.render.call(this);
        // this.collection.each( this.add );
        this.model.get('units').each( this.add );
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
var log = debug('client:view:global');

jstonkers.client.view.Global = Backbone.View.extend({
    events:{
        'click .navbar .brand':     'onNavigate',
        'click .navbar .nav li':    'onNavigate'
    },

    initialize: function(){
        var self = this;
        jstonkers.eventBus.bind('view:show', function(viewName){
            $('.navbar .nav li').removeClass('active');
            $('.navbar .nav li[data-name="' + viewName + '"]').addClass('active');
        });
        JSTC.events.bind('start', function(){
            var fontCache = JSTC.bitmapFontCanvas;
            var $text = self.$('.bitmap-text');
            var text = $text.text();
            // console.log('text: ' + text );
            var width = $text.width(), height = $text.height();

            var bounds = fontCache.add( text, {col:[["#FFF","#F00"]] } ).bounds;

            // var bounds = fontCache.getBounds( text );
            var canvas = document.createElement('canvas');
        
            canvas.width = width = Math.max(bounds[2],width); 
            canvas.height = height = Math.max(bounds[3],height);
            $text.empty().append( canvas );
            var ctx = canvas.getContext('2d');
            // ctx.fillStyle = "rgb(150,29,28)";
            // ctx.fillRect (0,0,width,height);
            
            

            fontCache.drawString( text, ctx, (width/2) - (bounds[2]/2),(height/2) - (bounds[3]/2), {index:0} );
        });
    },

    onNavigate: function(evt){
        var $target = $(evt.target);
        evt.preventDefault();
        jstonkers.eventBus.trigger('navigate', $target.attr('href') );
    },

    render: function(){
        log('rendering global');
        return this;
    }
});

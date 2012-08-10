var log = debug('client:view:ticker');

jstonkers.client.view.Ticker = Backbone.View.extend({

    initialize: function(){
        _.bindAll( this, 'draw' );
        this.last = Date.now();
        this.index = 0;
        this.interval = 100;
    },

    attach: function( $el ){
        if( !$.contains(document.body, this.el) ){
            this.setElement( $el );
            // determine dims of element
            this.initializeCanvas();
        }
    },

    initializeCanvas: function(){
        this.canvas = document.createElement('canvas');
        
        this.canvas.width = this.$el.width();
        this.canvas.height = this.$el.height();
        this.$el.empty().append( this.canvas );
        this.$canvas = $(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        // this.bounds = [0,0,0,0];
        // 
        this.fontCache = jstonkers.client.bitmapFontCanvas;
        this.fontCache.add( "stonkers", {col:[["#FFF","#F00"]] } );
        this.fontCache.add( "press any key to start", {key:'descr', col:['#4F4','#FF4']} );

        jstonkers.eventBus.bind('anim', this.draw );
    },

    render: function(){
        return this;
    },

    draw: function( now ){
        
        if( now > this.last+this.interval ){
            this.last = now;
            this.index = this.index ? 0 : 1;    
        } else
            return;

        this.fontCache.drawString( "descr", this.ctx, 200,0, {index:this.index} );
        // this.fontCache.drawString( "stonkers", this.ctx, 50,0 );
    }

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    // make: function(tagName, attributes, content) {
    //     return $($('#tmpl_edit_potd').text()).get(0);
    // }
});
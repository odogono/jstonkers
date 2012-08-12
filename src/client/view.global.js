var log = debug('client:view:global');

jstonkers.client.view.Global = Backbone.View.extend({
    events:{
        'click .navbar .brand':     'onNavigate',
        'click .navbar .nav li':    'onNavigate'
    },

    initialize: function(){
        jstonkers.eventBus.bind('view:show', function(viewName){
            $('.navbar .nav li').removeClass('active');
            $('.navbar .nav li[data-name="' + viewName + '"]').addClass('active');
        });
    },

    onNavigate: function(evt){
        var $target = $(evt.target);
        evt.preventDefault();
        jstonkers.eventBus.trigger('navigate', $target.attr('href') );
    },
});

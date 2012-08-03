
jstonkers.client.view.Ticker = Backbone.View.extend({

    initialize: function(){
    },

    render: function(){
        return this;
    },

    /**
    *   Called when the View is first created (before initialize)
    *   useful because then the main element is only created once - all
    *   render updates are simply changing values.
    */
    make: function(tagName, attributes, content) {
        return $($('#tmpl_edit_potd').text()).get(0);
    }
});
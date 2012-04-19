jstonkers = window.jstonkers || { util:{}, model:{}, collection:{}, view:{}, controller:{} };

jstonkers.log = function(msg,logStatic){
    var $container = $('#log'),
        $entry = null,
        count = $container.find('li').size();
    // msg = new Date.getTime() + ': ' + msg;
    msg = ': ' + msg;
    if( logStatic ){
        $('#logline').text(msg);
        return;
    }
    if( count < 15 ){
        $entry = $('<li>' + msg + '</li>');
        $container.append($entry);    
    }
    else {
        // find the first child - change it - and add it to the end
        $container.append( $container.find('li:first').text(msg).detach() );
    }//*/
};

window.log = console.debug;

// jstonkers.EventBus = new EventEmitter2({
//     wildcard:true,
//     // delimiter:'::'
// });
// jstonkers.EventBus.onAny(function(){
//     console.log(arguments);
// });


jstonkers.EventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
jstonkers.EventBus.bind( 'all', function(){
    // var args = Array.prototype.slice.call(arguments,0);
    console.log(arguments);
});
jstonkers.EventBus.emit = jstonkers.EventBus.trigger;


jstonkers.Element = function( el, $selector, name ){
    this.$el = $(el);
    this.type = 'text';
    this.name = name || this.$el.attr('name');
    this.form = this.$el.closest('form');

    if( this.$el.is('input,textarea') ){
        this.type = 'input';
        if( this.$el.is(':radio') ){
            this.type = 'radio';
            // this.values = $selector;
        }else if( this.$el.is('input:checkbox') ){
            this.type = 'chk'; 
        }
    } else if( this.$el.is('select')){
        this.type = 'slc';
    }
};
_.extend(jstonkers.Element.prototype, {
    set: function( value ){
        switch( this.type ){
            case 'chk':
                this.$el.attr('checked', value ? true : false );
                break;
            case 'text':
                this.$el.text( value ); 
                break;
            case 'radio':
                this.form.find('[name="' + this.name + '"][value="' + value + '"]').attr('checked','checked');
                break;
            case 'slc':
                $("option[value=" + value +"]", this.$el).attr("selected","selected")
                // this.$el.val( value ); 
                // this.$el.attr('selected','selected');
                break;
            default:
                // console.log('setting to ' + value )
                this.$el.val( value ); 
                break;
        }
        return this;
    },
    get: function(){
        switch( this.type ){
            case 'chk':
                return this.$el.is(':checked');
            case 'text':
                return this.$el.text();
            case 'radio':
                return this.form.find('[name="' + this.name + '"]:checked').val();
            case 'slc':
                result = this.$el.val();
                if( result === null || result === undefined ){
                    result = this.$el.find('option:first').val();
                }
                return result;
            default:
                
                return this.$el.val();
        }
    }
});


// from http://stackoverflow.com/questions/7567404/backbone-js-repopulate-or-recreate-the-view/7607853#7607853
jstonkers.BaseView = function (options) {
    this.bindings = {};
    Backbone.View.apply(this, [options]);
};




_.extend(jstonkers.BaseView.prototype, Backbone.View.prototype, {

    bindTo: function (model, ev, callback) {
        model.on(ev, callback, this);
        var key = model.cid + ev;
        if( this.bindings[key] )
            this.unbindFrom(model,ev);    
        this.bindings[key] = { model: model, ev: ev, callback: callback };
        return this;
    },

    unbindFrom: function(model, ev, callback ){
        // console.log('unbinding ' + ev);
        model.off( ev, callback );
        var key = model.cid + ev;
        delete this.bindings[key];
        return this;
    },
    unbindFromAll: function () {
        _.each(this.bindings, function (binding) {
            // console.log('unbinding ' + binding.ev);
            binding.model.off(binding.ev, binding.callback);
        });
        this.bindings = {};
        return this;
    },

    dispose: function () {
        console.log('disposing of view ' + this.cid);
        this.unbindFromAll(); // this will unbind all events that this view has bound to 
        this.unbind(); // this will unbind all listeners to events from this view. This is probably not necessary because this view will be garbage collected.
        this.remove(); // uses the default Backbone.View.remove() method which removes this.el from the DOM and removes DOM events.
        return this;
    },

    unbindElementsFromModel: function( elements, model ){
        var self = this;
        model = model || this.model;
        // console.log('unbinding elements...');
        _.each( elements, function(el){
            if( !_.isFunction(el) ){
                var $el = $(el),
                    field = $el.attr('name');
                self.unbindFrom( model, 'change:'+field );
            }
        });

        self._elements = {};
    },

    bindElementsToModel: function( elements, model, readIntoModel ){
        model = model || this.model;
        var self = this;

        self._elements = {};
        
        var generalChangeHandler = function(model,changes){
            // console.log('generalChangeHandler');
            // console.log( JSON.stringify(arguments) );

            _.each( changes, function(change){
                if( self._elements[change] ){
                    // console.log('generalChangeHandler: updating ' + change + '/' + self._elements[change].name + ' to ' + model.get(change) );
                    self._elements[change].set( model.get(change) );
                }//else
                    // console.log('generalChangeHandler: nupdating ' + change );
            });
        }
        // self.unbindFrom( model, 'change' );
        // self.bindTo( model, 'change', generalChangeHandler );

        _.each( elements, function(el){
            if( _.isFunction(el) ){ el(); } else {
                var $el = $(el),
                    evtType = 'change',
                    field = $el.attr('name'),
                    elClass = $el.attr('class').split(' ')[0],
                    selector = '.' + elClass + '[name=' + field + ']',
                    $selector = self.$(selector),
                    element = new jstonkers.Element( el, $selector, field );
                
                // console.log('adding element ' + field);
                self._elements[ field ] = element;

                var changeHandler = function(model,val,options){
                    // console.log('changeHandler');
                    // if there are several changes at once, then apply all the changes
                    if( options.changes )
                        generalChangeHandler( model, _.keys(options.changes) );
                    else{
                        // console.log( _.keys(options.changes) );
                        // console.log( options.changes );
                        // console.log('changing ' + field + ' to ' + val );
                        element.set(val);
                    }
                };

                // console.log('un/binding ' + field );
                self.unbindFrom( model, 'change:'+field );
                self.bindTo( model, 'change:' + field, changeHandler );

                var eventHandler = function(evt){
                    target = self.$(evt.target);
                    data = {};
                    data[field] = element.get();
                    model.set(data);
                };

                self.$(selector).off(evtType, eventHandler).on( evtType, eventHandler );
                // set initial value of form elements
                if( readIntoModel ){
                    data = {};
                    data[field] = element.get();
                    model.set(data,{silent:false});
                    // console.log( model.cid + ' : ' + JSON.stringify(model)  );
                }else{
                    // console.log('getting ' + field + ' ' + model.get(field));
                    element.set( model.get(field) );
                }
            }
        });
    }
});

jstonkers.BaseView.extend = Backbone.View.extend;


jstonkers.util.compileURL = function(url, parameters){
    if( !_.isEmpty(parameters) ){
        url += '?';
        url += _.map( parameters, function(v,k){
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }).join('&');
    }
    return url;
};


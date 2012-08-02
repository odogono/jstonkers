
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


// window.clog = console.debug;
var log;

if (window.console && typeof console.log === "function"){
  // use apply to preserve context and invocations with multiple arguments
  clog = log = function () { console.log.apply(console, arguments); };
} else {
  clog = log = function(){ return; }
}


jstonkers.Status = {
    ACTIVE: 'atv',
    INACTIVE: 'iat',
    DISABLED: 'dis',
    LOGICALLY_DELETED: 'ldl',
};




jstonkers.eventBus = _.extend({}, Backbone.Events,{cid : 'event_bus'});
jstonkers.eventBus.bind( 'all', function(){
    clog(arguments);
});
jstonkers.eventBus.emit = jstonkers.eventBus.trigger;

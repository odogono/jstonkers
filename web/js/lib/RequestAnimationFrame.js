// window.requestAnimaionFrame, credit: Erik Moller
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
(function() {
    var lastTime = 0;
    var vendors = ["webkit", "moz", "ms", "o"];
    var x;

    for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+"RequestAnimationFrame"];
    }

    window.cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame; // Check for older syntax
    for(x = 0; x < vendors.length && !window.cancelAnimationFrame; ++x) {
        window.cancelAnimationFrame = window[vendors[x]+"CancelAnimationFrame"] || window[vendors[x]+"CancelRequestAnimationFrame"];
    }

    // Manual fallbacks
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    
    // window.animationStartTime
    if(!window.animationStartTime) {
        getter = (function() {
            for(x = 0; x < vendors.length; ++x) {
                if(window[vendors[x] + "AnimationStartTime"]) {
                    return function() { return window[vendors[x] + "AnimationStartTime"]; };
                }
            }

            return function() { return Date.now(); };
        })();

        Object.defineProperty(window, "animationStartTime", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }
}());
export default function debounce(fn, delay, options) {
    var timeoutId;
    if (!options) options = {};
    var leadingExc = false;

    return function() {
        var that = this,
            args = arguments;
        if (!leadingExc&&!(options.leading === false)) {
            fn.apply(that, args);
        }
        leadingExc=true;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function() {
            if (!(options.trailing === false)) {
                fn.apply(that, args);
            }
            leadingExc=false;
        }, delay);
    }
}
export default function throttle(fn,delay) {
    var wait=false;
    return function(){
        var that = this,args=arguments;
        if(!wait){
            wait=true;
            setTimeout(function () {
                fn.apply(that,args);
                wait=false;
            },delay);
        }
    }
}
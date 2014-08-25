define(['require'], function (require) {

    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
    }

    Worker.prototype = {
        init: function init(code) {
            console.log("Initialized:\n"+code);
        }
    };

    return Worker;
});
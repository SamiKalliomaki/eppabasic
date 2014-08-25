define(['require'], function (require) {

    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
    }

    Worker.prototype = {
        init: function init(code) {
            this.Program = new Function('stdlib', 'env', 'heap', code);
            console.log(this.Program.toString());
        }
    };

    return Worker;
});
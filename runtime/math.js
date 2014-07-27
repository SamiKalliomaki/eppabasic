function EbMath(heap) {
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

EbMath.prototype = {
    env: {
        // Powers and roots
        sqrt: function sqrt(sp) {
            this.MEMF32[(sp - 4) >> 2] = Math.sqrt(this.MEMF32[(sp - 4) >> 2]);
        },

        rand: function rand(a, b) {
            return a + parseInt(Math.random() * (b - a + 1));
        },      

        // Time function
        hours: function hours() {
            return new Date().getHours();
        },
        minutes: function minutes() {
            return new Date().getMinutes();
        },
        seconds: function seconds() {
            return new Date().getSeconds();
        },
        milliseconds: function milliseconds() {
            return new Date().getMilliseconds();
        }
    },

    stdlib: {}
};
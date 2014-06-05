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
        // Casting operators
        dbl: function dbl(sp) {
            var x = this.MEMS32[(sp - 4) >> 2];
            this.MEMF32[(sp - 4) >> 2] = x;
        },
        int: function int(sp) {
            var x = this.MEMF32[(sp - 4) >> 2];
            this.MEMS32[(sp - 4) >> 2] = x;
        },

        // Trigonometric functions
        sin: function sin(sp) {
            this.MEMF32[(sp - 4) >> 2] = Math.sin(this.MEMF32[(sp - 4) >> 2]);
        },
        cos: function cos(sp) {
            this.MEMF32[(sp - 4) >> 2] = Math.cos(this.MEMF32[(sp - 4) >> 2]);
        },

        // Powers and roots
        sqrt: function sqrt(sp) {
            this.MEMF32[(sp - 4) >> 2] = Math.sqrt(this.MEMF32[(sp - 4) >> 2]);
        },
        
        // Random numbers
        random: function random(sp) {
            this.MEMF32[sp >> 2] = Math.random();
        },
        randint: function randint(sp) {
            var a = this.MEMS32[(sp - 8) >> 2];
            var b = this.MEMS32[(sp - 4) >> 2];
            var r = a+parseInt(Math.random()*(b-a+1));
            this.MEMS32[(sp - 8) >> 2] = r;
        },

        // Time function
        hours: function hours(sp) {
            this.MEMS32[sp >> 2] = new Date().getHours();
        },
        minutes: function minutes(sp) {
            this.MEMS32[sp >> 2] = new Date().getMinutes();
        },
        seconds: function seconds(sp) {
            this.MEMS32[sp >> 2] = new Date().getSeconds();
        },
        milliseconds: function milliseconds(sp) {
            this.MEMS32[sp >> 2] = new Date().getMilliseconds();
        }
    },

    stdlib: {}
};
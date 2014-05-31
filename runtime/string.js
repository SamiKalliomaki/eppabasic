function EbString(heap) {
    this.MEMU8 = new Uint8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

EbString.prototype = {
    env: {
        print: function print(sp) {
            var ptr = this.MEMS32[(sp - 4) >> 2];
            var len = this.MEMS32[ptr >> 2];
            var buf = [];
            for (var i = 0; i < len; i++) {
                buf.push(String.fromCharCode(this.MEMU8[ptr + i + 8]));
            }
            var str = buf.join('');
            alert(str);
        }
    },

    stdlib: {}
};
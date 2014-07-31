function EbString(heap, strUtil) {
    this.MEMU8 = new Uint8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);
    this.strUtil = strUtil;

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

EbString.prototype = {
    env: {
        integerToString: function integerToString(val) {
            return this.strUtil.toEppaBasic('' + (val | 0));
        },
        doubleToString: function doubleToString(val) {
            return this.strUtil.toEppaBasic('' + (+val));
        },
    },

    stdlib: {}
};
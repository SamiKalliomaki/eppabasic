function StringUtils(heap) {
    this.heap = heap;
    this.MEMS32 = new Int32Array(heap);
    this.MEMU8 = new Int8Array(heap);
}

StringUtils.prototype = {
    toString: function toString(ptr) {
        var len = this.MEMS32[ptr >> 2];
        var i = 0;
        var buf = [];
        while (i < len) {
            var charcode = this.MEMU8[ptr + 4 + i];
            for (var j = 7; j >= 0; j--) {
                if (!(charcode & (1 << j)))
                    break;
                charcode ^= 1 << j;
            }
            i++;
            while ((this.MEMU8[ptr + 4 + i] & 0x80) && !(this.MEMU8[ptr + 4 + i] & 0x40) && i < len) {
                charcode = (charcode << 6) | (0x3f & this.MEMU8[ptr + 4 + i]);
                i++;
            }
            buf.push(String.fromCodePoint(charcode));
        }
        return buf.join('');
    }
};
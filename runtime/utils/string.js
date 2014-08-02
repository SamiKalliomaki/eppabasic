function StringUtils(heap) {
    this.heap = heap;
    this.MEMS32 = new Int32Array(heap);
    this.MEMU8 = new Uint8Array(heap);
}

StringUtils.prototype = {
    setProgram: function setProgram(program) {
        this.program = program;
    },

    toEppaBasic: function toEppaBasic(str) {
        var utf8 = toUTF8Array(str);
        var ptr = this.program.memreserve(utf8.length + 4);
        this.MEMS32[ptr >> 2] = utf8.length;
        for (var i = 0; i < utf8.length; i++)
            this.MEMU8[ptr + 4 + i] = utf8[i];
        return ptr;
    },
    fromEppaBasic: function fromEppaBasic(ptr) {
        if (!ptr)
            return '';          // a null pointer is an empty string

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

// From StackOverflow: http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
            // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >> 18),
                      0x80 | ((charcode >> 12) & 0x3f),
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
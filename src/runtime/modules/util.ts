/**
 * Converts rgb value to string understood by css and canvas
 * @param r Amount of red
 * @param g Amount of green
 * @param b Amount of blue
 * @returns Color value converted to string
 */
export function rgbToStyle(r: number, g: number, b: number) {
    var rgb = (r << 16) | (g << 8) | (b << 0);
    return '#' + ('000000' + rgb.toString(16)).substr(-6);
}

import Runtime = require('../Runtime');

/**
 * Functions for handling EppaBasic strings.
 */
export module ebstring {
    /**
     * Converts a string to format understood by EppaBasic.
     * @parma str String to convert
     * @returns A pointer to EppaBasic string
     */
    export function toEB(str: string, runtime: Runtime): number {
        var MEMS32 = runtime.program.MEMS32;
        var MEMU8 = runtime.program.MEMU8;

        var utf8 = toUTF8Array(str);
        var ptr = runtime.program.memreserve(utf8.length + 4);
        MEMS32[ptr >> 2] = utf8.length;
        for (var i = 0; i <utf8.length; i++)
            MEMU8[ptr + 4 + i] = utf8[i];
        return ptr;
    }
    /**
     * Converts an EppaBasic string pointer to JavaScript string.
     * @parma ptr Pointer to EppaBasic string
     * @returns JavaScript string
     */
    export function fromEB(ptr: number, runtime: Runtime): string {
        if (!ptr)
                return '';

        var MEMS32 = runtime.program.MEMS32;
        var MEMU8 = runtime.program.MEMU8;

        var len = MEMS32[ptr];
        var end = ptr + 4 + len;
        var i = ptr + 4;
        var buf = [];
        while (i < end) {
            var charcode = MEMU8[i];
            for (var j = 7; j >= 0; j--) {
                if (!(charcode & (1 << j)))
                    break;
                charcode ^= 1 << j;
            }
            i++;
            while ((MEMU8[i] & 0x80) && !(MEMU8[i] & 0x40) && i < end) {
                charcode = (charcode << 6) | (0x3f & MEMU8[i]);
                i++;
            }
            buf.push(String.fromCharCode(charcode));
        }
        return buf.join('');
    }

    // From StackOverflow: http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    // Edited for TypeScript
    function toUTF8Array(str: string): number[] {
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
}

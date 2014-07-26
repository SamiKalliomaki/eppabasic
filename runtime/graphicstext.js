function GraphicsText(canvasHolder, heap) {
    this.console = document.createElement('div');
    canvasHolder.appendChild(this.console);

    this.MEMU8 = new Uint8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

GraphicsText.prototype = {


    /*
     * Functions for the program
     */
    env: {
        // TODO Console showing and hiding
        showConsole: function showConsole(sp) {
            //this.canvas.style.visibility = "hidden";
        },
        hideConsole: function hideConsole(sp) {
            //this.canvas.style.visibility = "visible";
        },

        printStr: function print(str) {
            var len = this.MEMS32[str >> 2];
            var i = 0;
            var buf = [];
            while (i < len) {
                var charcode = this.MEMU8[str + 4 + i];
                for (var j = 7; j >= 0; j--) {
                    if (!(charcode & (1 << j)))
                        break;
                    charcode ^= 1 << j;
                }
                i++;
                while ((this.MEMU8[str + 4 + i] & 0x80) && !(this.MEMU8[str + 4 + i] & 0x40) && i < len) {
                    charcode = (charcode << 6) | (0x3f & this.MEMU8[str + 4 + i]);
                    i++;
                }
                buf.push(String.fromCodePoint(charcode));
            }
            str = buf.join('');

            alert(str);
        },
        printInt: function printInt(a) {
            alert(a);
        },
        printDbl: function printDbl(a) {
            alert(a);
        }
    },
    stdlib: {}
};
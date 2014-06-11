function GraphicsText(canvasHolder, heap) {
    this.console = document.createElement('div');
    canvasHolder.appendChild(this.console);

    this.MEMU8 = new Uint8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    this.console.addEventListener('keyup', (function (e) {
        alert('Moi');
    }).bind(this), true);

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

        print: function print(sp) {
            var ptr = this.MEMS32[(sp - 4) >> 2];
            var len = this.MEMS32[ptr >> 2];
            var buf = [];
            for (var i = 0; i < len; i++) {
                buf.push(String.fromCharCode(this.MEMU8[ptr + i + 8]));
            }
            var str = buf.join('');

            this.console.innerHTML = this.console.innerHTML + str + "<br />";
        },
        printInt: function printInt(sp) {
            this.console.innerHTML = this.console.innerHTML + this.MEMS32[(sp - 4) >> 2] + "<br />";
        },
        printDbl: function printDbl(sp) {
            this.console.innerHTML = this.console.innerHTML + this.MEMF32[(sp - 4) >> 2] + "<br />";
        }
    },
    stdlib: {}
};
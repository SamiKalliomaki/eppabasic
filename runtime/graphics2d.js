function Graphics2D(canvasHolder, heap) {
    this.canvas = document.createElement('canvas');
    canvasHolder.appendChild(this.canvas);

    this.canvas.style.left = "0px";
    this.canvas.style.top = "0px";
    this.canvas.style.position = "absolute";
    this.canvas.style.background = "black";

    this.ctx = this.canvas.getContext('2d');
    this.MEMS32 = new Int32Array(heap);
    this.MEMU8 = new Uint8Array(heap);    
    this.MEMF32 = new Float32Array(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
    
    
}

Graphics2D.prototype = {
    setSize: function setSize(widht, height) {
        this.canvas.width = widht;
        this.canvas.height = height;
    },

    /*
     * Functions for the program
     */
    env: {
        clearColor: function clearColor(sp) {
            var r = this.MEMS32[(sp - 12) >> 2];
            var g = this.MEMS32[(sp - 8) >> 2];
            var b = this.MEMS32[(sp - 4) >> 2];
            this.clearColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        lineColor: function lineColor(sp) {
            var r = this.MEMS32[(sp - 12) >> 2];
            var g = this.MEMS32[(sp - 8) >> 2];
            var b = this.MEMS32[(sp - 4) >> 2];
            this.ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        fillColor: function fillColor(sp) {
            var r = this.MEMS32[(sp - 12) >> 2];
            var g = this.MEMS32[(sp - 8) >> 2];
            var b = this.MEMS32[(sp - 4) >> 2];
            this.ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        rect: function rect(sp) {
            var x = this.MEMS32[(sp - 16) >> 2];
            var y = this.MEMS32[(sp - 12) >> 2];
            var w = this.MEMS32[(sp - 8) >> 2];
            var h = this.MEMS32[(sp - 4) >> 2];

            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.stroke();
        },
        fillRect: function fillRect(sp) {
            var x = this.MEMS32[(sp - 16) >> 2];
            var y = this.MEMS32[(sp - 12) >> 2];
            var w = this.MEMS32[(sp - 8) >> 2];
            var h = this.MEMS32[(sp - 4) >> 2];

            this.ctx.fillRect(x, y, w, h);
        },
        circle: function circle(sp) {
            var x = this.MEMS32[(sp - 12) >> 2];
            var y = this.MEMS32[(sp - 8) >> 2];
            var r = this.MEMS32[(sp - 4) >> 2];

            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            this.ctx.stroke();
        },
        fillCircle: function fillCircle(sp) {
            var x = this.MEMS32[(sp - 12) >> 2];
            var y = this.MEMS32[(sp - 8) >> 2];
            var r = this.MEMS32[(sp - 4) >> 2];

            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            this.ctx.fill();
        },
        line: function line(sp) {
            var x1 = this.MEMS32[(sp - 16) >> 2];
            var y1 = this.MEMS32[(sp - 12) >> 2];
            var x2 = this.MEMS32[(sp - 8) >> 2];
            var y2 = this.MEMS32[(sp - 4) >> 2];

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        },
        dot: function dot(sp) {
            var x = this.MEMS32[(sp - 8) >> 2];
            var y = this.MEMS32[(sp - 4) >> 2];
            this.ctx.fillRect(x, y, 1, 1);
        },
        clear: function clear(sp) {
            var origStyle = this.ctx.fillStyle;
            this.ctx.fillStyle = this.clearColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = origStyle;
        },
        drawScreen: function drawScreen(sp) {
            this.canvas.style.visibility = "visible";
        },

        showConsole: function showConsole(sp) {
            this.canvas.style.visibility = "hidden";
        },
        hideConsole: function hideConsole(sp) {
            this.canvas.style.visibility = "visible";
        },

        print: function print(sp) {
            var ptr = this.MEMS32[(sp - 4) >> 2];
            var len = this.MEMS32[ptr >> 2];
            var buf = [];
            for (var i = 0; i < len; i++) {
                buf.push(String.fromCharCode(this.MEMU8[ptr + i + 8]));
            }
            var str = buf.join('');
            var console = document.getElementById("console");
            console.value = console.value + str + "\n";
            this.canvas.style.visibility = "hidden";
        },
        printInt: function printInt(sp) {
            var console = document.getElementById("console");
            console.value = console.value + this.MEMS32[(sp - 4) >> 2] + "\n";
            this.canvas.style.visibility = "hidden";
        },
        printDbl: function printDbl(sp) {
            var console = document.getElementById("console");
            console.value = console.value + this.MEMF32[(sp - 4) >> 2] + "\n";
            this.canvas.style.visibility = "hidden";
        }
    },
    stdlib: {}
};
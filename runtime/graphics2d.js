function Graphics2D(canvasHolder, heap) {
    this.canvas = document.createElement('canvas');
    canvasHolder.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.MEMS32 = new Int32Array(heap);

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

            this.ctx.rect(x, y, w, h);
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
        },

        // TODO Fix printing function
        printInt: function printInt(sp) {
        },
        printDbl: function printDbl(sp) {
        }
    },
    stdlib: {}
};
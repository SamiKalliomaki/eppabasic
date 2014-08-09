function Graphics2D(canvasHolder, heap, strUtil, theEnv) {
    this.canvas = document.createElement('canvas');
    canvasHolder.appendChild(this.canvas);
    this.canvasHolder = canvasHolder;

    this.ctx = this.canvas.getContext('2d');
    this.MEMU8 = new Int8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    this.strUtil = strUtil;
    this.theEnv = theEnv;

    this.printX = 5;
    this.printY = 5;
    this.clearColor = "rgb(0,0,0)";
    this.textColor = "rgb(255,255,255)";
    this.textFont = "Arial";
    this.textSize = 12;
    this.textAlign = 1;

    this.cancel = false; // input functions

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

Graphics2D.prototype = {
    setSize: function setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        // Set the window size
        var outerWidth = width + (window.outerWidth - window.innerWidth);
        var outerHeight = height + (window.outerHeight - window.innerHeight);
        window.resizeTo(outerWidth, outerHeight);

        // Set canvas to scale according to the size
        this.canvasHolder.style.width = '100vw';
        this.canvasHolder.style.height = (100 / (width / height)) + 'vw';
        this.canvasHolder.style.maxHeight = '100vh';
        this.canvasHolder.style.maxWidth = (100 * width / height) + 'vh';
    },
    setProgram: function setProgram(program) {
        this.program = program;
    },
    print: function print(str, a) {
        var origStyle = this.ctx.fillStyle;
        this.ctx.font = this.textSize + "px " + this.textFont;
        this.ctx.fillStyle = this.textColor;
        if (a == 1) this.ctx.textAlign = "left";
        if (a == 2) this.ctx.textAlign = "right";
        if (a == 3) this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillText(str, this.printX, this.printY);
        this.printY += this.textSize + this.textSize / 10;
        this.ctx.fillStyle = origStyle;
    },

    /*
     * Functions for the program
     */
    env: {
        clearColor: function clearColor(r, g, b) {
            if (r < 0) r = 0;
            if (g < 0) g = 0;
            if (b < 0) b = 0;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            document.body.style.backgroundColor = this.clearColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        lineColor: function lineColor(r, g, b) {
            if (r < 0) r = 0;
            if (g < 0) g = 0;
            if (b < 0) b = 0;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            this.ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        lineWidth: function lineWidth(x) {
            this.ctx.lineWidth = x;
        },
        fillColor: function fillColor(r, g, b) {
            if (r < 0) r = 0;
            if (g < 0) g = 0;
            if (b < 0) b = 0;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            this.ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        rect: function rect(x, y, w, h) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.stroke();
        },
        fillRect: function fillRect(x, y, w, h) {
            this.ctx.fillRect(x, y, w, h);
        },
        triangle: function triangle(x1, y1, x2, y2, x3, y3) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.stroke();
        },
        fillTriangle: function fillTriangle(x1, y1, x2, y2, x3, y3) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.fill();
        },
        circle: function circle(x, y, r) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            this.ctx.stroke();
        },
        fillCircle: function fillCircle(x, y, r) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            this.ctx.fill();
        },
        line: function line(x1, y1, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            //this.ctx.lineCap = "round";            
            this.ctx.stroke();
        },
        dot: function dot(x, y) {
            this.ctx.fillRect(x, y, 1, 1);
        },
        text: function text(x, y, ptr) {
            var len = this.MEMS32[ptr >> 2];
            var buf = [];
            for (var i = 0; i < len; i++) {
                buf.push(String.fromCharCode(this.MEMU8[ptr + i + 8]));
            }
            var str = buf.join('');

            var x = this.MEMS32[(sp - 12) >> 2];
            var y = this.MEMS32[(sp - 8) >> 2];

            this.ctx.fillText(str, x, y);
        },
        clear: function clear() {
            var origStyle = this.ctx.fillStyle;
            this.ctx.fillStyle = this.clearColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = origStyle;
            this.printX = 5;
            this.printY = 5;
        },
        drawScreen: function drawScreen() {
            this.program.breakExec();
        },
        getWidth: function getWidth() {
            return this.canvas.width | 0;
        },
        getHeight: function getHeight() {
            return this.canvas.height | 0;
        },
        setWidth: function setWidth(width) {
            if (width < 0) return;
            this.setSize(width, this.canvas.height);
        },
        setHeight: function setHeight(height) {
            if (height < 0) return;
            this.setSize(this.canvas.width, height);
        },
        setSize: function setSize(width, height) {
            this.setSize(width, height);
        },
        fullScreen: function fullScreen() {
            if (this.canvas.requestFullscreen)
                this.canvas.requestFullscreen();
            else if (this.canvas.mozRequestFullScreen)
                this.canvas.mozRequestFullScreen();
            else if (this.canvas.webkitRequestFullScreen)
                this.canvas.webkitRequestFullScreen();
            else if (this.canvas.msRequestFullScreen)
                this.canvas.msRequestFullScreen();
        },

        printStr: function printStr(str) {
            str = this.strUtil.fromEppaBasic(str);
            this.print(str, 1);
        },
        printInt: function printInt(a) {
            this.print(a, 1);
        },
        printDbl: function printDbl(a) {
            this.print(a, 1);
        },
        drawText: function drawText(x, y, str) {
            this.printX = x;
            this.printY = y;
            str = this.strUtil.fromEppaBasic(str);
            this.print(str, this.textAlign);
        },
        drawTextA: function drawTextA(x, y, str, a) {
            this.printX = x;
            this.printY = y;
            str = this.strUtil.fromEppaBasic(str);
            this.print(str, a + 1);
        },
        textColor: function textColor(r, g, b) {
            if (r < 0) r = 0;
            if (g < 0) g = 0;
            if (b < 0) b = 0;
            if (r > 255) r = 255;
            if (g > 255) g = 255;
            if (b > 255) b = 255;
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            this.textColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        textFont: function textFont(str) {
            str = this.strUtil.fromEppaBasic(str);
            this.textFont = str;
        },
        textSize: function textSize(x) {
            this.textSize = x;
        },
        textAlign: function textAlign(x) {
            this.textAlign = x;
        },
        message: function message(str) {
            str = this.strUtil.fromEppaBasic(str);
            alert(str);
            this.theEnv.allDown();
        },
        askNumber: function askNumber(str) {
            str = this.strUtil.fromEppaBasic(str);
            var res = prompt(str);
            this.theEnv.allDown();
            this.cancel = false;
            if (res === null) {
                this.cancel = true;
                return 0;
            }
            return parseInt(res);
        },
        askText: function askText(str) {
            str = this.strUtil.fromEppaBasic(str);
            var res = prompt(str);
            this.theEnv.allDown();
            this.cancel = false;
            if (res === null) {
                this.cancel = true;
                return this.strUtil.toEppaBasic("");
            }
            return this.strUtil.toEppaBasic(res);
        },
        inputCancel: function inputCancel() {
            return this.cancel;
        },

        setWindowTitle: function setWindowTitle(str) {
            str = this.strUtil.fromEppaBasic(str);
            document.title = str;
        },
        getWindowTitle: function getWindowTitle() {
            return this.strUtil.toEppaBasic(document.title);
        },
    },
    stdlib: {}
};
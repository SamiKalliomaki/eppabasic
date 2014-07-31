function Graphics2D(canvasHolder, heap, strUtil) {
    this.canvas = document.createElement('canvas');
    canvasHolder.appendChild(this.canvas);
    this.canvasHolder = canvasHolder;

    this.ctx = this.canvas.getContext('2d');
    this.MEMU8 = new Int8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    this.strUtil = strUtil;

    this.printX = 5;
    this.printY = 5;
    this.clearColor = "rgb('0,0,0')";
    this.textColor = "rgb('255,255,255')";
    this.textFont = "Arial"
    this.textSize = 12;

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
        if (a == 0) this.ctx.textAlign = "left";
        if (a == 1) this.ctx.textAlign = "right";
        if (a == 2) this.ctx.textAlign = "center";
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
            document.body.style.backgroundColor = this.clearColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        lineColor: function lineColor(r, g, b) {
            this.ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        lineWidth: function lineWidth(x) {
            this.ctx.lineWidth = x;
        },
        fillColor: function fillColor(r, g, b) {
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
        width: function width() {
            return this.canvas.width | 0;
        },
        height: function height() {
            return this.canvas.height | 0;
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
            this.print(str, 0);
        },
        printInt: function printInt(a) {
            this.print(a, 0);
        },
        printDbl: function printDbl(a) {
            this.print(a, 0);
        },
        drawText: function drawText(x, y, str) {
            this.printX = x;
            this.printY = y;
            str = this.strUtil.fromEppaBasic(str);
            this.print(str, 0);
        },
        drawTextA: function drawTextA(x, y, str, a) {
            this.printX = x;
            this.printY = y;
            str = this.strUtil.fromEppaBasic(str);
            this.print(str, a);
        },
        textColor: function textColor(r, g, b) {
            this.textColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        },
        textFont: function textFont(str) {
            str = this.strUtil.fromEppaBasic(str);
            this.textFont = str;
        },
        textSize: function textSize(x) {
            this.textSize = x;
        },
        message: function message(str) {
            str = this.strUtil.fromEppaBasic(str);
            alert(str);
        },
        askNumber: function askNumber(str) {
            str = this.strUtil.fromEppaBasic(str);
            return parseInt(prompt(str));
        },
        askText: function askText(str) {
            return 0;
        },
        setWindowTitle: function setWindowTitle(str) {
            str = this.strUtil.fromEppaBasic(str);
            document.title = str;
        },
        getWindowTitle: function getWindowTitle() {
            return 0;
        },
    },
    stdlib: {}
};
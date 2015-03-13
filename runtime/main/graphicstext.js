define(function () {
    function GraphicsText() {
        function restart() {
            this.textAlign = 1;
            this.textColor = '#fff';
            this.textFont = 'monospace';
            this.textSize = 12;
            this.printOriginX = 5;
            this.printOriginY = 5;
            this.printOffsetY = 0;
            this.lineSpacing = 1.2;
            this.graphicstext.commands.clear.apply(this);
        }
        restart.apply(this);
        this.worker.on('restart', restart.bind(this));
    }

    function drawText(x, y, str, align) {
        if (typeof align === 'undefined')
            align = this.textAlign;

        var originalStyle = this.ctx.fillStyle;
        this.ctx.font = this.textSize + 'px ' + this.textFont;
        this.ctx.fillStyle = this.textColor;
        if (align === 1) this.ctx.textAlign = 'left';
        if (align === 2) this.ctx.textAlign = 'right';
        if (align === 3) this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(str, x, y);
        this.ctx.fillStyle = originalStyle;
    }

    GraphicsText.prototype = {
        commands: {
            clear: function clear() {
                this.printOffsetY = 0;
            },

            drawText: drawText,

            print: function print(str) {
                drawText.apply(this, [
                    this.printOriginX,
                    this.printOriginY + this.printOffsetY,
                    str
                ]);
                this.printOffsetY += this.lineSpacing * this.textSize;
            },
            printLocation: function printLocation(x, y) {
                this.printOriginX = x;
                this.printOriginY = y;
                this.printOffsetY = 0;
            },

            setLineSpacing: function setLineSpacing(lineSpacing) {
                this.lineSpacing = lineSpacing;
            },
            setWindowTitle: function setWindowTitle(title) {
                document.title = title;
            },

            textAlign: function textAlign(align) {
                this.textAlign = align;
            },
            textColor: function textColor(rgb) {
                this.textColor = '#' + ('000000' + rgb.toString(16)).substr(-6);
            },
            textFont: function textFont(font) {
                this.textFont = font;
            },
            textSize: function textSize(size) {
                this.textSize = size;
            }
        }
    };

    return GraphicsText;
});
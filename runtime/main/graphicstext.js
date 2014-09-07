define(function () {
    function GraphicsText() {
        this.textAlign = 1;
        this.textColor = '#fff';
        this.textFont = 'monospace';
        this.textSize = 12;
        this.printOriginX = 0;
        this.printOriginY = 0;
        this.printOffsetY = 0;
    }

    function drawText(x, y, str, align) {
        console.log(str);
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
            drawText: drawText,

            print: function print(str) {
                drawText.apply(this, [
                    this.printOriginX,
                    this.printOriginY + this.printOffsetY,
                    str,
                    1                   // Align left
                ]);
                this.printOffsetY += this.textSize;
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
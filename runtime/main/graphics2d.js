define(['require'], function (require) {
    "use strict";

    function Graphics2D() {
        function restart() {
            this.clearColor = '#000';               // The background is black
            this.ctx.strokeStyle = '#fff';          // And the line color is white
            this.ctx.fillStyle = '#fff';            // As is fill color
            this.graphics2d.commands.clear.apply(this);
        }
        restart.apply(this);
        this.worker.on('restart', restart.bind(this));
    }

    Graphics2D.prototype = {
        commands: {
            circle: function circle(x, y, r) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                this.ctx.stroke();
            },
            clear: function clear() {
                var origStyle = this.ctx.fillStyle;
                this.ctx.fillStyle = this.clearColor;
                this.ctx.fillRect(0, 0, this.canvas[0].width, this.canvas[0].height);
                this.ctx.fillStyle = origStyle;
                //this.printX = 5;
                //this.printY = 5;
            },
            clearColor: function clearColor(rgb) {
                // TODO Use jQuery instead
                this.clearColor = '#' + ('000000' + rgb.toString(16)).substr(-6);
            },

            dot: function dot(x, y) {
                this.ctx.fillRect(x, y, 1, 1);
            },

            fillCircle: function fillCircle(x, y, r) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                this.ctx.fill();
            },
            fillColor: function fillColor(rgb) {
                this.ctx.fillStyle = '#' + ('000000' + rgb.toString(16)).substr(-6);
            },
            fillRect: function fillRect(x, y, w, h) {
                this.ctx.fillRect(x, y, w, h);
            },
            fillTriangle: function fillTriangle(x1, y1, x2, y2, x3, y3) {
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.lineTo(x3, y3);
                this.ctx.fill();
            },

            line: function line(x1, y1, x2, y2) {
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            },
            lineColor: function lineColor(rgb) {
                this.ctx.strokeStyle = '#' + ('000000' + rgb.toString(16)).substr(-6);
            },
            lineWidth: function lineWidth(x) {
                this.ctx.lineWidth = x;
            },

            rect: function rect(x, y, w, h) {
                this.ctx.beginPath();
                this.ctx.rect(x, y, w, h);
                this.ctx.stroke();
            },

            setCanvasHeight: function setCanvasHeight(height) {
                this.setResolution(this.canvasWidth, height, true);
            },
            setCanvasSize: function setCanvasSise(width, height) {
                this.setResolution(width, height, true);
            },
            setCanvasWidth: function setCanvasWidth(width) {
                this.setResolution(width, this.canvasHeight, true);
            },
            setWindowHeight: function setWindowHeight(height) {
                this.setSize(this.windowWidth, height);
            },
            setWindowSize: function setWindowSize(width, height) {
                this.setSize(width, height);
            },
            setWindowWidth: function setWindowWidth(width) {
                this.setSize(width, this.windowHeight);
            },

            triangle: function triangle(x1, y1, x2, y2, x3, y3) {
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.lineTo(x3, y3);
                this.ctx.lineTo(x1, y1);
                this.ctx.stroke();
            }
        }
    };

    return Graphics2D;
});
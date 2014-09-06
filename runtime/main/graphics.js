define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Graphics(worker, canvasHolder) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;

        // Create the canvas
        this.canvas = $('<canvas/>');
        canvasHolder.append(this.canvas);
        this.ctx = this.canvas[0].getContext('2d');

        // Create a buffer canvas for resizing
        this.buffer = $('<canvas/>');
        this.buffer.hide();
        canvasHolder.append(this.buffer);
        this.bufferCtx = this.buffer[0].getContext('2d');

        // Set default values for the drawing context
        this.clearColor = '#000';               // The background is black
        this.ctx.strokeStyle = '#fff';          // And the line color is white

        this.worker.on('drawscreen', this.onDrawScreen.bind(this));
    }

    Graphics.prototype = {
        setSize: function setSize(width, height) {
            // Copy the current image to a buffer
            this.buffer.width(this.canvas.width());
            this.buffer.height(this.canvas.height());
            this.bufferCtx.drawImage(this.canvas[0], 0, 0);

            // Set the canvas size
            this.canvas[0].width = width;
            this.canvas[0].height = height;

            // Set the window size
            var outerWidth = width + (window.outerWidth - window.innerWidth);
            var outerHeight = height + (window.outerHeight - window.innerHeight);
            window.resizeTo(outerWidth, outerHeight);

            // Set the canvas to retain its aspect ratio
            this.canvasHolder.width('100vw');
            this.canvasHolder.height((100 / (width / height)) + 'vw');
            this.canvasHolder.css('maxHeight', '100vh');
            this.canvasHolder.css('maxWidth', (100 * width / height) + 'vh');

            // Copy and scale the image back from the buffer
            this.ctx.drawImage(this.buffer[0], 0, 0, this.canvas.width(), this.canvas.height());
        },

        onDrawScreen: function onDrawScreen(commands) {
            commands.forEach(function (args) {
                var name = args[0];
                args = args[1];
                this.commands[name].apply(this, args);
            }.bind(this));
        },

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

    return Graphics;
});
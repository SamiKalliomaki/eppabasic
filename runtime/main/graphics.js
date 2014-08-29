define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Graphics(worker, canvasHolder) {
        this.worker = worker;
        // Create the canvas
        this.canvas = $('<canvas/>');
        canvasHolder.append(this.canvas);
        this.ctx = this.canvas[0].getContext('2d');

        // Set default values for the drawing context
        this.clearColor = '#000';               // The background is black
        this.ctx.strokeStyle = '#fff';          // And the line color is white

        this.worker.on('drawscreen', this.drawScreen.bind(this));
    }

    Graphics.prototype = {
        commands: {
            circle: function circle(x, y, r) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                this.ctx.stroke();
            },
            clear: function clear() {
                var origStyle = this.ctx.fillStyle;
                this.ctx.fillStyle = this.clearColor;
                this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height());
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

        },

        drawScreen: function drawScreen(commands) {
            commands.forEach(function (args) {
                var name = args[0];
                args = args[1];
                this.commands[name].apply(this, args);
            }.bind(this));
        }
    };

    return Graphics;
});
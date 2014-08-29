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
            line: function line(x1, y1, x2, y2) {
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
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
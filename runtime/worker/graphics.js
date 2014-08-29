define(['require'], function (require) {
    "use strict";

    function Graphics(mirror) {
        this.mirror = mirror;
        this.commandQueue = [];
    }

    Graphics.prototype = {
        env: {
            circle: function circle(x, y, r) {
                this.addCommand('circle', x, y, r);
            },
            clear: function clear() {
                this.addCommand('clear');
            },
            clearColor: function clearColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) || (g << 8) || b;
                this.addCommand('clearColor', rgb);
            },

            dot: function dot(x, y) {
                this.addCommand('dot', x, y);
            },
            drawScreen: function drawScreen() {
                // Send the commands
                this.mirror.send('drawscreen', this.commandQueue);
                // And clear the queue
                this.commandQueue = [];
            },

            fillCircle: function fillCircle(x, y, r) {
                this.addCommand('fillCircle', x, y, r);
            },
            fillColor: function fillColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) || (g << 8) || b;
                this.addCommand('fillColor', rgb);
            },
            fillRect: function fillRect(x, y, w, h) {
                this.addCommand('fillRect', x, y, w, h);
            },
            fillTriangle: function fillTriangle(x1, y1, x2, y2, x3, y3) {
                this.addCommand('fillTriangle', x1, y1, x2, y2, x3, y3);
            },

            line: function line(x1, y1, x2, y2) {
                this.addCommand('line', x1, y1, x2, y2);
            },
            lineColor: function lineColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) || (g << 8) || b;
                this.addCommand('lineColor', rgb);
            },
            lineWidth: function lineWidth(x) {
                this.addCommand('lineWidth', x);
            },

            rect: function rect(x, y, w, h) {
                this.addCommand('rect', x, y, w, h);
            },

            triangle: function triangle(x1, y1, x2, y2, x3, y3) {
                this.addCommand('triangle', x1, y1, x2, y2, x3, y3);
            }
        },

        addCommand: function addCommand(name, args) {
            args = Array.prototype.slice.call(arguments, 1);
            this.commandQueue.push([name, args]);
        },

        extendEnv: function extendEnv(env) {
            for (var func in this.env) {
                if (this.env.hasOwnProperty(func)) {
                    if (env.hasOwnProperty(func))
                        throw new Error('Duplicate property of \'' + func + '\' in program env');
                    env[func] = this.env[func].bind(this);
                }
            }
        }
    };

    return Graphics;

    // Some utils
    function clamp(x, min, max) {
        return Math.min(Math.max(x, min), max);
    }
});
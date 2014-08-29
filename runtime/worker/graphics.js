define(['require'], function (require) {
    "use strict";

    function Graphics(mirror) {
        this.mirror = mirror;
        this.commandQueue = [];
    }

    Graphics.prototype = {
        env: {
            line: function line(x1, y1, x2, y2) {
                this.addCommand('line', x1, y1, x2, y2);
            },

            drawScreen: function drawScreen() {
                this.mirror.send('drawscreen', this.commandQueue);
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
});
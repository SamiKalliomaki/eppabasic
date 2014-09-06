define(['require'], function (require) {
    "use strict";

    function Graphics(mirror, strutil) {
        this.mirror = mirror;
        this.strutil = strutil;
        this.commandQueue = [];

        this.screenWidth = 0;
        this.screenHeight = 0;
        this.windowWidth = 0
        this.windowHeight = 0;

        this.mirror.on('setresolution', this.onSetResolution.bind(this));
        this.mirror.on('resize', this.onResize.bind(this));
    }

    Graphics.prototype = {
        setProgram: function setProgram(program) {
            this.program = program;
        },

        onResize: function onResize(width, height) {
            this.windowWidth = width;
            this.windowHeight = height;
        },
        onSetResolution: function onSetResolution(width, height) {
            this.screenWidth = width;
            this.screenHeight = height;
        },

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
                var rgb = (r << 16) | (g << 8) | b;
                this.addCommand('clearColor', rgb);
            },

            dot: function dot(x, y) {
                this.addCommand('dot', x, y);
            },
            drawScreen: function drawScreen() {
                // Send the commands
                this.mirror.send('drawscreen', this.commandQueue);
                // Clear the queue
                this.commandQueue = [];
                // And break the execution
                this.program.breakExec();
            },
            drawText: function drawText(x, y, str, align) {
                str = this.strutil.fromEppaBasic(str);
                this.addCommand('drawText', x, y, str, align);
            },
            drawTextAlign: function drawTextAlign(x, y, str, align) {
                str = this.strutil.fromEppaBasic(str);
                this.addCommand('drawText', x, y, str, align);
            },

            fillCircle: function fillCircle(x, y, r) {
                this.addCommand('fillCircle', x, y, r);
            },
            fillColor: function fillColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) | (g << 8) | b;
                this.addCommand('fillColor', rgb);
            },
            fillRect: function fillRect(x, y, w, h) {
                this.addCommand('fillRect', x, y, w, h);
            },
            fillTriangle: function fillTriangle(x1, y1, x2, y2, x3, y3) {
                this.addCommand('fillTriangle', x1, y1, x2, y2, x3, y3);
            },

            getScreenWidth: function getScreenWidth() {
                return this.screenWidth;
            },
            getScreenHeight: function getScreenHeight() {
                return this.screenHeight;
            },
            getWindowWidth: function getWindowWidth() {
                return this.windowWidth;
            },
            getWindowHeight: function getWindowHeight() {
                return this.windowHeight;
            },

            line: function line(x1, y1, x2, y2) {
                this.addCommand('line', x1, y1, x2, y2);
            },
            lineColor: function lineColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) | (g << 8) | b;
                this.addCommand('lineColor', rgb);
            },
            lineWidth: function lineWidth(x) {
                this.addCommand('lineWidth', x);
            },

            rect: function rect(x, y, w, h) {
                this.addCommand('rect', x, y, w, h);
            },

            setScreenWidth: function setScreenWidth(width) {
                this.screenWidth = width;
                this.addCommand('setScreenWidth', width);
            },
            setScreenHeight: function setScreenHeight(height) {
                this.screenHeight = height;
                this.addCommand('setScreenHeight', height);
            },
            setWindowWidth: function setWindowWidth(width) {
                this.windowWidth = width;
                this.addCommand('setWindowWidth', width);
            },
            setWindowHeight: function setWindowHeight(height) {
                this.windowHeight = height;
                this.addCommand('setWindowHeight', height);
            },

            textAlign: function textAlign(align) {
                this.addCommand('textAlign', align);
            },
            textColor: function textColor(r, g, b) {
                r = clamp(r, 0, 255);
                g = clamp(g, 0, 255);
                b = clamp(b, 0, 255);
                var rgb = (r << 16) | (g << 8) | b;
                this.addCommand('textColor', rgb);
            },
            textFont: function textFont(str) {
                str = this.strutil.fromEppaBasic(str);
                this.addCommand('textFont', str);
            },
            textSize: function textSize(size) {
                this.addCommand('textSize', size);
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
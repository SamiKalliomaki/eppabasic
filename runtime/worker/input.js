define(['require'], function (require) {
    "use strict";

    function Input(mirror) {
        this.mirror = mirror;

        // Key data
        this.keysDown = new Array(256);
        this.keysHit = new Array(256);
        this.mouseButtons = 0;
        this.mouseX = this.mouseY = -1;
        this.mouseHit = 0;

        // Add listeners
        this.mirror.on('keydown', this.onKeyDown.bind(this));
        this.mirror.on('keyup', this.onKeyUp.bind(this));
        this.mirror.on('mousemove', this.onMouseMove.bind(this));
        this.mirror.on('mousedown', this.onMouseDown.bind(this));
        this.mirror.on('mouseup', this.onMouseUp.bind(this));
    }

    Input.prototype = {
        onKeyDown: function onKeyDown(keyCode) {
            if (!this.keysDown[keyCode])
                this.keysHit[keyCode] = true;
            this.keysDown[keyCode] = true;
        },
        onKeyUp: function onKeyUp(keyCode) {
            this.keysDown[keyCode] = false;
        },
        onMouseMove: function onMouseMove(x, y, buttons, button) {
            this.mouseX = x;
            this.mouseY = y;

            if (buttons)
                this.mouseButtons = buttons;
            else
                this.mouseButtons |= button;
        },
        onMouseDown: function onMouseDown(x, y, buttons, button) {
            this.mouseX = x;
            this.mouseY = y;

            if (buttons)
                this.mouseButtons = buttons;
            else
                this.mouseButtons |= button;
        },
        onMouseUp: function onMouseUp(x, y, buttons, button) {
            this.mouseX = x;
            this.mouseY = y;

            if (buttons)
                this.mouseButtons = buttons;
            else
                this.mouseButtons &= ~button;
        },

        env: {
            // Keyboard functions
            keyDown: function keyDown(key) {
                return this.keysDown[key];
            },
            keyUp: function keyUp(key) {
                return !this.keyDown(key);
            },
            keyHit: function keyHit(key) {
                var val = this.keysHit[key];
                this.keysHit[key] = false;
                return val;
            },

            // Mouse functions
            mouseX: function mouseX() {
                return this.mouseX;
            },
            mouseY: function mouseY() {
                return this.mouseY;
            },
            mouseDown: function mouseDown(key) {
                return (this.mouseButtons & (1 << (key - 1))) !== 0;
            },
            mouseUp: function mouseUp(key) {
                return (this.mouseButtons & (1 << (key - 1))) === 0;
            },
            mouseHit: function mouseHit(key) {
                if (this.mouseHit & (1 << (key - 1))) {
                    this.mouseHit ^= (1 << (key - 1));
                    return 1;
                }
                return 0;
            }
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

    return Input;
});
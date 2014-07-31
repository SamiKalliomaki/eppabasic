function Input(heap, canvasHolder, container) {
    this.MEMS32 = new Int32Array(heap);
    this.keysDown = new Array(256);
    this.keysHit = new Array(256);
    this.mouseButtons = 0;
    this.mouseX = this.mouseY = -1;

    this.scale = 1;

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }

    // Add event listeners
    container.addEventListener('keydown', this.keyDown.bind(this), true);
    container.addEventListener('keyup', this.keyUp.bind(this), true);
    container.addEventListener('mousemove', this.mouse.bind(this), true);
    container.addEventListener('mouseup', this.mouse.bind(this), true);
    container.addEventListener('mousedown', this.mouse.bind(this), true);

    container.addEventListener('contextmenu', function contextMenu(e) {
        e.preventDefault();
        return false;
    }, false);

    // For resizing
    this.canvasHolder = canvasHolder;
    var canvas = canvasHolder.getElementsByTagName('canvas')[0];
    window.addEventListener('resize', function resize() {
        this.scale = canvas.width / canvasHolder.offsetWidth;
    }.bind(this));
}

Input.prototype = {
    env: {
        keyDown: function keyDown(key) {
            return this.keysDown[key];
        },
        keyUp: function keyUp(key) {
            return !this.keysDown[key];
        },
        keyHit: function keyHit(key) {
            var val = this.keysHit[key];
            this.keysHit[key] = false;
            return val;
        },

        mouseX: function mouseX() {
            return this.mouseX;
        },
        mouseY: function mouseY() {
            return this.mouseY;
        },
        mouseDown: function mouseDown(key) {
            return (this.mouseButtons & (1 << (key - 1))) !== 0;
        }
    },

    keyDown: function keyDown(e) {
        if (!this.keyDown[e.keyCode])
            this.keysHit[e.keyCode] = true;
        this.keysDown[e.keyCode] = true;
        e.preventDefault();
        return false;
    },
    keyUp: function keyUp(e) {
        this.keysDown[e.keyCode] = false;
        e.preventDefault();
        return false;
    },
    mouse: function mouse(e) {
        // Position
        this.mouseX = (e.pageX - this.canvasHolder.offsetLeft) * this.scale;
        this.mouseY = (e.pageY - this.canvasHolder.offsetTop) * this.scale;
        // Buttons
        if (!e.buttons) {
            switch (e.which) {
                case 0: break;
                case 1: e.buttons = 1; break;
                case 2: e.buttons = 4; break;
                case 3: e.buttons = 2; break;
            }
        }
        this.mouseButtons = e.buttons;
        e.preventDefault();
        return false;
    },

    stdlib: {}
};

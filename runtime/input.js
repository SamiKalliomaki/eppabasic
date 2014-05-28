function Input(heap, container) {
    this.MEMS32 = new Int32Array(heap);
    this.keysPressed = new Array(256);
    this.mousePressed = new Array(16);
    this.mouseX = this.mouseY = -1;

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
}

Input.prototype = {
    env: {
        keyDown: function isKeyDown(sp) {
            this.MEMS32[(sp - 4) >> 2] = this.keysPressed[this.MEMS32[(sp - 4) >> 2]] | 0;
        },
        keyUp: function isKeyUp(sp) {
            this.MEMS32[(sp - 4) >> 2] = (!this.keysPressed[this.MEMS32[(sp - 4) >> 2]]) | 0;
        },

        mouseX: function getMouseX(sp) {
            this.MEMS32[sp >> 2] = this.mouseX;
        },
        mouseY: function getMouseY(sp) {
            this.MEMS32[sp >> 2] = this.mouseY;
        },
        mouseDown: function mouseDown(sp) {
            this.MEMS32[(sp - 4) >> 2] = this.mousePressed[this.MEMS32[(sp - 4) >> 2] - 1] | 0;
        }
    },

    keyDown: function keyDown(e) {
        this.keysPressed[e.keyCode] = true;
        e.preventDefault();
        return false;
    },
    keyUp: function keyUp(e) {
        this.keysPressed[e.keyCode] = false;
        e.preventDefault();
        return false;
    },
    mouse: function mouse(e) {
        // Position
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        // Buttons
        for (var i = 0; i < 16; i++)
            this.mousePressed[i] = e.buttons & (1 << i);
        e.preventDefault();
        return false;
    },

    stdlib: {}
};
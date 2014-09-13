define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Input(worker, canvasHolder, canvas) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;
        this.canvas = canvas;

        // For mouse handling
        this.mouseButtons = 0;
        this.mouseHit = 0;

        // Add some listeners
        $(document.body).on('keydown', this.onKeyDown.bind(this));
        $(document.body).on('keyup', this.onKeyUp.bind(this));
        document.body.addEventListener('mousemove', this.onMouse.bind(this), true);
        document.body.addEventListener('mouseup', this.onMouse.bind(this), true);
        document.body.addEventListener('mousedown', this.onMouse.bind(this), true);
        $(window).on('resize', this.onResize.bind(this));
        setTimeout(this.onResize.bind(this), 0);                    // Set the scale when the window is ready

        // Prevent context menu
        document.body.addEventListener('contextmenu', function contextMenu(e) {
            e.preventDefault();
            return false;
        }, false);

        // Get focus to the canvas holder
        this.canvasHolder.focus();
    }

    Input.prototype = {
        onResize: function onResize() {
            this.scale = this.canvas[0].width / this.canvasHolder[0].offsetWidth;
            // Also tell the worker of the resize
            this.worker.send('resize', this.canvasHolder[0].offsetWidth, this.canvasHolder[0].offsetHeight);
        },
        onKeyDown: function onKeyDown(e) {
            this.worker.send('keydown', e.keyCode);
        },
        onKeyUp: function onKeyUp(e) {
            this.worker.send('keyup', e.keyCode);
        },

        onMouse: function onMouse(e) {
            // Position
            var offset = this.canvasHolder.offset();
            var mouseX = (e.pageX - offset.left) * this.scale;
            var mouseY = (e.pageY - offset.top) * this.scale;

            if (!e.buttons) {
                switch (e.which) {
                    case 0: break;
                    case 1: e.buttons = 1; break;
                    case 2: e.buttons = 4; break;
                    case 3: e.buttons = 2; break;
                }
            }
            this.mouseButtons = e.buttons;
            if (e.type == "mousedown") {
                if (e.button == 0) this.mouseHit |= 1;
                if (e.button == 1) this.mouseHit |= 4;
                if (e.button == 2) this.mouseHit |= 2;
                if (!e.button) {
                    if (e.which == 1) this.mouseHit |= 1;
                    if (e.which == 2) this.mouseHit |= 2;
                    if (e.which == 3) this.mouseHit |= 4;
                }
            }
            if (e.type == "mouseup") {
                if (e.button == 0) this.mouseButtons &= (~1);
                if (e.button == 1) this.mouseButtons &= (~4);
                if (e.button == 2) this.mouseButtons &= (~2);
                if (!e.button) {
                    if (e.which == 1) this.mouseButtons &= (~1);
                    if (e.which == 2) this.mouseButtons &= (~2);
                    if (e.which == 3) this.mouseButtons &= (~4);
                }
            }

            this.worker.send('mouse', mouseX, mouseY, this.mouseButtons, this.mouseHit);

            return false;
        }
    };

    return Input;
});
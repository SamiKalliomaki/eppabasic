define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Input(worker, canvasHolder, canvas) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;
        this.canvas = canvas;

        // Add some listeners
        $(document.body).on('keydown', this.onKeyDown.bind(this));
        $(document.body).on('keyup', this.onKeyUp.bind(this));
        $(document.body).on('mousemove', this.onMouse.bind(this));
        $(document.body).on('mouseup', this.onMouse.bind(this));
        $(document.body).on('mousedown', this.onMouse.bind(this));
        $(window).on('resize', this.onResize.bind(this));
        setTimeout(this.onResize.bind(this), 0);                    // Set the scale when the window is ready

        // Get focus to the canvas holder
        this.canvasHolder.focus();
    }

    Input.prototype = {
        onResize: function onResize() {
            this.scale = this.canvas[0].width / this.canvasHolder[0].offsetWidth;
        },
        onKeyDown: function onKeyDown(e) {
            this.worker.send('keydown', e.keyCode);
            e.preventDefault();
            return false;
        },
        onKeyUp: function onKeyUp(e) {
            this.worker.send('keyup', e.keyCode);
            e.preventDefault();
            return false;
        },

        onMouse: function onMouse(e) {
            // Position
            var offset = this.canvasHolder.offset();
            var mouseX = (e.pageX - offset.left) * this.scale;
            var mouseY = (e.pageY - offset.top) * this.scale;

            var button = 0;
            switch (e.button || e.which) {
                case 0: break;
                case 1: button = 1; break;
                case 2: button = 4; break;
                case 3: button = 2; break;
            }

            this.worker.send(e.type, mouseX, mouseY, e.buttons, button);

            e.preventDefault();
            return false;
        }
    };

    return Input;
});
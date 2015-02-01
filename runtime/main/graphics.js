define(['require', 'jquery', './graphics2d', './graphicstext'], function (require) {
    "use strict";

    var $ = require('jquery');
    var Graphics2D = require('./graphics2d');
    var GraphicsText = require('./graphicstext');

    function Graphics(worker, canvasHolder) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;

        // Create the canvas
        this.canvas = $('<canvas/>');
        canvasHolder.append(this.canvas);
        this.ctx = this.canvas[0].getContext('2d');

        // Create a buffer canvas for resizing
        this.buffer = $('<canvas/>');
        this.buffer.hide();
        canvasHolder.append(this.buffer);
        this.bufferCtx = this.buffer[0].getContext('2d');

        // Set some default values for the context
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.windowWidth = 0
        this.windowHeight = 0;

        // And then create the drawers
        this.graphics2d = Object.create(Graphics2D.prototype);
        Graphics2D.call(this);
        this.graphicstext = Object.create(GraphicsText.prototype);
        GraphicsText.call(this);


        this.worker.on('drawscreen', this.onDrawScreen.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
    }

    Graphics.prototype = {
        onResize: function onResize() {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
        },
        setSize: function setSize(width, height, fromWorker) {
            this.windowWidth = width;
            this.windowHeight = height;

            // Set the window size
            var outerWidth = width + (window.outerWidth - window.innerWidth);
            var outerHeight = height + (window.outerHeight - window.innerHeight);
            window.resizeTo(outerWidth, outerHeight);
        },
        setResolution: function setResolution(width, height, fromWorker) {
            // Copy the context styles
            var fillStyle = this.ctx.fillStyle;
            var font = this.ctx.font;
            var lineWidth = this.ctx.lineWidth;
            var strokeStyle = this.ctx.strokeStyle;

            // Remember the resolutin
            this.canvasWidth = width;
            this.canvasHeight = height;

            // Copy the current image to a buffer
            this.buffer.width(this.canvas.width());
            this.buffer.height(this.canvas.height());
            this.bufferCtx.drawImage(this.canvas[0], 0, 0);

            // Set the canvas size
            this.canvas[0].width = width;
            this.canvas[0].height = height;

            // Set the canvas to retain its aspect ratio
            this.canvasHolder.width('100vw');
            this.canvasHolder.height((100 / (width / height)) + 'vw');
            this.canvasHolder.css('maxHeight', '100vh');
            this.canvasHolder.css('maxWidth', (100 * width / height) + 'vh');

            // Copy and scale the image back from the buffer
            this.ctx.drawImage(this.buffer[0], 0, 0, this.canvas.width(), this.canvas.height());

            // Finally tell the worker about the size change if nessessary
            if (!fromWorker)
                this.worker.send('setresolution', width, height);

            // Copy the context styles back
            this.ctx.fillStyle = fillStyle;
            this.ctx.font = font;
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = strokeStyle;
        },

        onDrawScreen: function onDrawScreen(commands) {
            commands.forEach(function (args) {
                var name = args[0];
                args = args[1];
                if (this.graphics2d.commands[name]) this.graphics2d.commands[name].apply(this, args);
                if (this.graphicstext.commands[name]) this.graphicstext.commands[name].apply(this, args);
                if (!this.graphics2d.commands[name] && !this.graphicstext.commands[name])
                    console.error('Unknown function: ' + name);
            }.bind(this));
        }
    };

    return Graphics;
});
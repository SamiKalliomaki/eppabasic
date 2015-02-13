define(['require', 'jquery', './workerclient', './graphics', './input', './messages', './panic'], function (require) {
    "use strict";

    var $ = require('jquery');
    var WorkerClient = require('./workerclient');
    var Graphics = require('./graphics');
    var Input = require('./input');
    var Messages = require('./messages');
    var Panic = require('./panic');

    function Runtime(editor, canvasHolder) {
        this.editor = editor;
        this.canvasHolder = canvasHolder;

        this.openWorker();
    }

    Runtime.prototype = {
        close: function close() {
            if (window && window.close)
                window.close();
        },
        init: function init(code) {
            this.worker.send('init', code);
        },
        start: function start() {
            if (!this.worker)
                throw new Error('Worker not initialize yet');

            // And set the screen size
            $(document).ready(function onReady() {
                var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') !== -1;
                // For firefox so that it sets the size exactly
                // Chrome sets the size to the minimum if setSize is called multiple times
                if (!isChrome)
                    this.graphics.setSize(0, 0);
                this.graphics.setSize(640, 480);
                this.graphics.setResolution(640, 480);

                // Start the worker
                this.worker.send('start');
            }.bind(this));
        },


        openWorker: function () {
            if (this.worker)
                throw new Error('A worker is already opened');      // TODO Destroy the previous one
            this.worker = new WorkerClient('../build/runtime/worker.js');

            this.worker.on('ready', function ready() {
                // Setup the output and input when the worker is ready
                this.graphics = new Graphics(this.worker, this.canvasHolder);
                this.input = new Input(this.worker, this.canvasHolder, this.graphics.canvas);
                this.messages = new Messages(this.worker, this.canvasHolder);
                this.panic = new Panic(this.worker);

                // Finally when the worker is ready the whole
                // runtime is ready. Tell that also to the editor
                // so that it can send back the code.
                this.editor.runtimeReady();
            }.bind(this));

            this.worker.on('end', this.close.bind(this));
        }
    };

    return Runtime;
});
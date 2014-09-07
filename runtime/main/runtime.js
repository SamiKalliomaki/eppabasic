define(['require', './workerclient', './graphics', './input', './messages'], function (require) {
    "use strict";

    var WorkerClient = require('./workerclient');
    var Graphics = require('./graphics');
    var Input = require('./input');
    var Messages = require('./messages');

    function Runtime(editor, canvasHolder) {
        this.editor = editor;
        this.canvasHolder = canvasHolder;

        this.openWorker();
    }

    Runtime.prototype = {
        close: function close() {
            this.worker.send('')
            window.close();
        },
        init: function init(code) {
            this.worker.send('init', code);
        },
        start: function start() {
            if (!this.worker)
                throw new Error('Worker not initialize yet');
            // Start the worker
            this.worker.send('start');

            // And set the screen size
            this.graphics.setSize(0, 0);
            this.graphics.setSize(640, 480);
            this.graphics.setResolution(640, 480);
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

                // Finally when the worker is ready the whole
                // runtime is ready. Tell that also to the editor
                // so that it can send back the code.
                this.editor.runtimeReady();
            }.bind(this));
        }
    };

    return Runtime;
});
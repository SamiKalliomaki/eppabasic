define(['require', './workerclient'], function (require) {
    "use strict";

    var WorkerClient = require('./workerclient');

    function Runtime(editor) {
        this.editor = editor;
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
            this.worker.send('start');
        },


        openWorker: function () {
            if (this.worker)
                throw new Error('A worker is already opened');      // TODO Destroy the previous one
            this.worker = new WorkerClient('../build/runtime/worker.js');

            this.worker.on('ready', function ready() {
                // Finally when the worker is ready the whole
                // runtime is ready. Tell that also to the editor
                // so that it can send back the code.
                this.editor.runtimeReady();
            }.bind(this));
        }
    };

    return Runtime;
});
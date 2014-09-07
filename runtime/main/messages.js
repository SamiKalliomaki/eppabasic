define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Messages(worker, canvasHolder) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;

        this.messageBox = this.canvasHolder.children('.messagebox');

        this.worker.on('askNumber', this.onAskNumber.bind(this));
        this.worker.on('askText', this.onAskText.bind(this));
        this.worker.on('message', this.onMessage.bind(this));
    }

    Messages.prototype = {
        onAskNumber: function onAskNumber(msg) {
            this.worker.send('response', 10 /* Response */);
        },
        onAskText: function onAskText(msg) {
            this.worker.send('response', "Hello World!" /* Response */);
        },
        onMessage: function onMessage(msg) {
            this.messageBox.text(msg);
            this.messageBox.show();
            this.messageBox.one('click', function click() {
                this.worker.send('response');
                this.messageBox.hide();
            }.bind(this));
        }
    };

    return Messages;
});
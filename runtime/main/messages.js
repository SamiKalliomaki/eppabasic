define(['require', 'jquery'], function (require) {
    "use strict";

    var $ = require('jquery');

    function Messages(worker, canvasHolder) {
        this.worker = worker;
        this.canvasHolder = canvasHolder;

        this.messageBox = $('.messageBox', this.canvasHolder);
        this.messageBoxText = $('.text', this.messageBox);
        this.messageBoxInput = $('input[type="text"]', this.messageBox);
        this.messageBoxButton = $('input[type="submit"]', this.messageBox);

        this.worker.on('askNumber', this.onAskNumber.bind(this));
        this.worker.on('askText', this.onAskText.bind(this));
        this.worker.on('message', this.onMessage.bind(this));
    }

    Messages.prototype = {
        askValue: function(msg, callback) {
            this.messageBoxText.text(msg);
            this.messageBoxInput.show();
            this.messageBoxInput.val('');
            this.messageBox.show();
            this.messageBoxInput.focus();

            var activated = false;

            var action = function() {
                if(activated) {
                    return;
                }

                activated = true;
                this.messageBox.hide();
                callback(this.messageBoxInput.val());
            }.bind(this);

            this.messageBoxInput.keypress(function(e) {
                if(e.which == 13) {
                    action();
                    return false;
                }
            });
            this.messageBoxButton.one('click', action);
        },

        onAskNumber: function onAskNumber(msg) {
            this.askValue(msg, function(val) {
                var output = parseFloat(val);

                if(!isNaN(output)) {
                    this.worker.send('response', output);
                } else {
                    this.onAskNumber(msg);
                }
            }.bind(this));
        },
        onAskText: function onAskText(msg) {
            this.askValue(msg, function(val) {
                this.worker.send('response', val);
            }.bind(this));
        },
        onMessage: function onMessage(msg) {
            this.messageBoxText.text(msg);
            this.messageBoxInput.hide();
            this.messageBox.show();
            this.messageBoxButton.one('click', function() {
                this.worker.send('response');
                this.messageBox.hide();
            }.bind(this));
        }
    };

    return Messages;
});
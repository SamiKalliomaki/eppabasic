define(function (require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var Mirror = require("../worker/mirror").Mirror;

    var EppaBasicWorker = exports.EppaBasicWorker = function (sender) {
        Mirror.call(this, sender);
        //this.setTimeout(500);
    };
    oop.inherits(EppaBasicWorker, Mirror);

    (function () {
        this.onUpdate = function () {
            var code = this.doc.getValue();
            this.sender.emit('change', [code]);
        }
    }).call(EppaBasicWorker.prototype);
});
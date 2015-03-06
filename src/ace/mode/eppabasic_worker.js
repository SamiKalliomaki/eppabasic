define(function (require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var Mirror = require("../worker/mirror").Mirror;

    var EppaBasicWorker = exports.EppaBasicWorker = function (sender) {
        Mirror.call(this, sender);
    };
    oop.inherits(EppaBasicWorker, Mirror);

    (function () {
    }).call(EppaBasicWorker.prototype);
});

define(function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var WorkerClient = require("../worker/worker_client").WorkerClient;

    var Range = require("../range").Range;

    exports.Mode = TextMode;
});

define(['require', './worker', './mirror', '../polyfill'], function (require) {
    "use strict";

    var Worker = require('./worker');
    var Mirror = require('./mirror');

    // Just create a new worker
    var mirror = new Mirror();
    var worker = new Worker(mirror);

    mirror.send('ready');
});

require(['runtime/worker/main']);
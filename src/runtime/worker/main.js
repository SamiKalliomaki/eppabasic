define(['require', './worker', './mirror'], function (require) {
    "use strict";

    var Worker = require('./worker');
    var Mirror = require('./mirror');

    // Just create a new worker
    var mirror = new Mirror();
    var worker = new Worker(mirror);

    mirror.send('ready');
});

require([
    // Preload polyfills...
    'runtime/polyfill',
    // ... and shims...
    'es5-shim', 'es6-shim'], function () {
        // Go to main
        require(['runtime/worker/main']);
    }
);

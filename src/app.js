requirejs.config({
    baseUrl: window.location.protocol + "//" + window.location.host
            + window.location.pathname.split("/").slice(0, -1).join("/"),
    //urlArgs: "bust=" + (new Date()).getTime(),              // For development only TODO Remove
    paths: {
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
    },
    shim: {
        'jqueryui': ['jquery']
    }
});

require([
    // Preload libraries...
    'jquery', 'jqueryui', 'i18n', 'ace/ace',
    // ... and shims...
    'es5-shim', 'es6-shim'], function () {
        // Go to main
        require(['editor/main']);
    }
);
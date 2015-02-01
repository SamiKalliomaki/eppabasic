requirejs.config({
    baseUrl: window.location.protocol + "//" + window.location.host
            + window.location.pathname.split("/").slice(0, -1).join("/"),
    //urlArgs: "bust=" + (new Date()).getTime(),              // For development only TODO Remove
    paths: {
        runtime: 'runtime',
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        text: '../libs/requirejs_text',
        esrever: '../libs/esrever'
    }
});

// Require polyfill
require(['libs/fullscreen-api-polyfill']);

// Require main
require(['runtime/main/main']);
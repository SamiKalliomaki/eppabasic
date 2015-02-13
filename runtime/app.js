requirejs.config({
    baseUrl: window.location.protocol + "//" + window.location.host
            + window.location.pathname.split("/").slice(0, -1).join("/"),
    //urlArgs: "bust=" + (new Date()).getTime(),              // For development only TODO Remove
    paths: {
        runtime: 'runtime',
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        i18n: 'libs/i18next.amd.withJQuery-1.7.3.min',
        text: '../libs/requirejs_text',
        esrever: '../libs/esrever'
    }
});

require([
    // Preload polyfills...
    'libs/fullscreen-api-polyfill', 'libs/workershim2', 'runtime/polyfill',
    // ...locales...
    'text!locales/en/runtime.json', 'text!locales/fi/runtime.json',
    // ... and shims...
    'libs/es5-shim', 'libs/es6-shim'], function () {
        // Go to main
        require(['runtime/main/main']);
    }
);
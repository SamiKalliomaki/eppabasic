requirejs.config({
    baseUrl: window.location.protocol + "//" + window.location.host
            + window.location.pathname.split("/").slice(0, -1).join("/"),
    //urlArgs: "bust=" + (new Date()).getTime(),              // For development only TODO Remove
    paths: {
        compiler: 'compiler',
        editor: 'editor/js',
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
        jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
        xregexp: 'libs/xregexp',
        i18n: 'libs/i18next.amd.withJQuery-1.7.3.min',
        text: 'libs/requirejs_text',
        ace: 'ace/lib/ace'
    },
    shim: {
        'jqueryui': ['jquery']
    }
});

// Preload some libraries and localse
require([
    'jquery', 'jqueryui', 'i18n', 'ace/ace', 'polyfill',
    'text!locales/en/translation.json', 'text!locales/fi/translation.json'],
    function () {
        // After libraries are loaded, go to main
        require(['editor/main']);
    }
);

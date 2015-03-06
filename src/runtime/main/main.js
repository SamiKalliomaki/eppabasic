define(['require', 'jquery', 'i18n', './runtime'], function (require, $, i18n) {
    "use strict";

    var Runtime = require('./runtime');

    i18n.init({
        cookieName: 'lang',
        fallbackLng: 'en-US',
        resGetPath: '../locales/__lng__/__ns__.json'
    }, function (t) {
        // Translate runtime body
        $('body').i18n();
    });
    i18n.loadNamespace('runtime');

    $(function () {
        // Get editor from the parent
        var editor = window.opener.ebeditor;

        var canvasHolder = $('#canvasHolder');

        // Create the runtime
        var runtime = new Runtime(editor, canvasHolder);

        // Return the runtime for the editor
        editor.setRuntime(runtime);

        $(window).unload(function () {
            editor.setRuntime(null);
        });
    });
});
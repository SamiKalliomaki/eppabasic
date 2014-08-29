define(['require', 'jquery', './runtime'], function (require, $) {
    "use strict";

    var Runtime = require('./runtime');
    $(function () {
        // Get editor from the parent
        var editor = window.opener.ebeditor;

        var canvasHolder = $('#canvasHolder');

        // Create the runtime
        var runtime = new Runtime(editor, canvasHolder);

        // Return the runtime for the editor
        editor.setRuntime(runtime);
    });
});
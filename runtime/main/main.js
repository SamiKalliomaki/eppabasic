define(['require', 'jquery', './runtime'], function (require, $) {
    "use strict";

    var Runtime = require('./runtime');
    $(function () {
        // Get editor from the parent
        var editor = window.opener.ebeditor;
        var runtime = new Runtime(editor);

        // Return the runtime for the editor
        editor.setRuntime(runtime);
    });
});
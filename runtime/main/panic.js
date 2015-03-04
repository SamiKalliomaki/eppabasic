define(['require', 'i18n'], function (require) {
    "use strict";

    var i18n = require('i18n');

    function Panic(worker,editor) {
        worker.on('panic', this.onPanic.bind(this));
        this.editor = editor;
    }

    Panic.prototype = {
        onPanic: function onPanic(errCode, line) {
            var short = i18n.t('runtime:errors.' + errCode + '.short');
            var long = i18n.t('runtime:errors.' + errCode + '.long');
            var atLine = i18n.t('runtime:errors.at.line', { line: line });
            this.editor.ace.gotoLine(line);
            alert(short + ' ' + atLine + '\n\n' + long);
        }
    };

    return Panic;
});
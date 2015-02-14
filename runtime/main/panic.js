define(['require', 'i18n'], function (require) {
    "use strict";

    var i18n = require('i18n');

    function Panic(worker) {
        worker.on('panic', this.onPanic.bind(this));
    }

    Panic.prototype = {
        onPanic: function onPanic(errCode, line) {
            var short = i18n.t('runtime:errors.' + errCode + '.short');
            var long = i18n.t('runtime:errors.' + errCode + '.long');
            var atLine = i18n.t('runtime:errors.at.line', { line: line });
            alert(short + ' ' + atLine + '\n\n' + long);
        }
    };

    return Panic;
});
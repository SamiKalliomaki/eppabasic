define(function(require, exports, module) {
    exports.isDark = false;
    exports.cssClass = "ace-eb";
    exports.cssText = '';//require("../requirejs/text!../../../css/light-theme.css");

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});

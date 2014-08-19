define(function (require, exports, module) {
    "use strict";
    var oop = require("../lib/oop");
    var Mirror = require("../worker/mirror").Mirror;

    // Eppabasic compiler parts
    var Lexer = require('compiler/lexer');
    var Toolchain = require('compiler/toolchain');
    var Compiler = require('compiler/compiler');

    var EppaBasicWorker = exports.EppaBasicWorker = function (sender) {
        Mirror.call(this, sender);

        this.toolchain = new Toolchain();
        //this.setTimeout(500);
    };
    oop.inherits(EppaBasicWorker, Mirror);

    (function () {
        this.onUpdate = function () {
            function showInternalError(e) {
                this.sender.emit('internalerror', [e.message + '@' + e.filename + ' ' + e.lineNumber]);
            }

            var code = this.doc.getValue();
            var cu = this.toolchain.getCompilationUnit(code);

            try {
                // Parse the code
                this.toolchain.parse(cu);
                // Typecheck
                this.toolchain.check(cu);
            } catch (e) {
                showInternalError(e);
            }

            this.sender.emit('parsed', [cu.errors]);
        }
    }).call(EppaBasicWorker.prototype);
});
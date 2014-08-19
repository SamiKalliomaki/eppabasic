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
            var code = this.doc.getValue();

            try {
                // Parse the code
                var cu = this.toolchain.parse(code);
                // Typecheck
                this.toolchain.check(cu);
                // And finally compile
                if (cu.errors.length === 0)
                    this.toolchain.compile(cu);

                this.sender.emit('parsed', [cu.errors]);
            } catch (e) {
                this.sender.emit('internalerror', [e.message + '@' + e.filename + ' ' + e.lineNumber]);
            }
        }
    }).call(EppaBasicWorker.prototype);
});
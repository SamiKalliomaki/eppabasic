﻿/// <reference path="../compiler/parser.js" />
/// <reference path="../compiler/operators.js" />
/// <reference path="../compiler/types.js" />
/// <reference path="../compiler/compiler.js" />

define(['compiler/toolchain', 'ace/ace', 'i18n'], function (Toolchain, ace, i18n) {
    function Editor(editorName, manual) {
        this.toolchain = new Toolchain();
        this.manual = manual;
        this.editorName = editorName;
        this.ace = ace.edit(editorName);
        this.ace.setTheme('ace/theme/chaos');
        this.ace.getSession().setMode('ace/mode/eppabasic');
        this.ace.setShowPrintMargin(false);
        this.modified = false;
        this.ace.on('change', function () {
            this.modified = true;
        }.bind(this));
    }
    Editor.prototype = {
        getCode: function getCode() {
            return this.ace.getValue();
        },
        setCode: function setCode(code) {
            this.ace.setValue(code, -1);
            this.modified = true;
        },
        runCode: function runCode() {
            function trySaveToStorage(storage, editor) {
                if (storage) {
                    storage.setItem('code', editor.getCode());
                    storage.setItem('code-modified', editor.modified);
                }
            }

            // FIXME Temporary solution, so code won't be lost if browser freezes...
            trySaveToStorage(localStorage, this);
            trySaveToStorage(sessionStorage, this);

            var cu = this.toolchain.getCompilationUnit(this.getCode());

            try {
                this.toolchain.parse(cu);
                this.toolchain.check(cu);
            } catch(e) {
                console.error(e);
            }

            this.ace.getSession().clearAnnotations();
            if (cu.errors.length !== 0) {
                this.showErrors(cu.errors);
                this.ace.gotoLine(cu.errors[0].line);
            } else {
                this.compiled = this.toolchain.compile(cu);
                this.run();
            }
        },
        run: function run() {
            this.runtimeReady(function ready() {
                this.window.ebruntime.init();
                this.window.ebruntime.start();
            });
            this.openRuntime();
        },
        showHelp: function showHelp() {
            var pos = this.ace.getCursorPosition();
            var line = this.ace.getSession().getLine(pos.row)
            var x1 = pos.column;
            var x2 = pos.column;
            var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            if (s.indexOf(line.charAt(x1)) == -1) return;
            while (x1 > 0 && s.indexOf(line.charAt(x1 - 1)) != -1) x1--;
            while (x2 < line.length - 1 && s.indexOf(line.charAt(x2 + 1)) != -1) x2++;
            var k = line.substring(x1, x2 + 1).toLowerCase();
            this.manual.navigate('/commands/' + k);
        },
        showErrors: function showError(errors) {
            var annotations = [];
            errors.forEach(function (e) {
                annotations.push({
                    row: e.line - 1,
                    text: i18n.t(e.msg, e.data),
                    type: 'error'
                });
            });
            this.ace.getSession().setAnnotations(annotations);
        },
        openRuntime: function openRuntime() {
            // Close opened window
            this.closeRuntime();
            this.window = window.open('runtime/index.html', 'runtime', 'dependent,resizable', true);
        },
        closeRuntime: function closeRuntime() {
            if (this.window)
                this.window.close();
        },
        runtimeReady: function runtimeReady(func) {
            if (func) {
                this.onRuntimeReady = func;
            } else {
                this.onRuntimeReady();
            }
        }
    };

    return Editor;
});

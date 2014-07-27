/// <reference path="../compiler/parser.js" />
/// <reference path="../compiler/operators.js" />
/// <reference path="../compiler/types.js" />
/// <reference path="../compiler/compiler.js" />

function Editor(editorName) {
    this.toolchain = new Toolchain();

    this.editorName = editorName;
    this.ace = ace.edit(editorName);
    this.ace.setTheme('ace/theme/chaos');
    this.ace.getSession().setMode('ace/mode/eppabasic');
    this.ace.setShowPrintMargin(false);
}

Editor.prototype = {
    getCode: function getCode() {
        return this.ace.getValue();
    },
    setCode: function setCode(code) {
        this.ace.setValue(code);
    },

    runCode: function runCode() { 
        try {
            cu = this.toolchain.parse(this.getCode());
            this.toolchain.check(cu);
            this.ace.getSession().clearAnnotations();

            this.compiled = this.toolchain.compile(cu);

            this.run();
        } catch(e) {
            if(e instanceof CompileError) {
                this.showError(e);
                this.ace.gotoLine(e.line);
            } else {
                alert(e.message);
                throw e;
            }
        }
    },

    run: function run() {
        this.runtimeReady(function ready() {
            this.window.ebruntime.init();
            this.window.ebruntime.start();
        });
        this.openRuntime();
    },

    showError: function showError(e) {
        this.ace.getSession().setAnnotations([{
            row: e.line - 1,
            text: e.msg, 
            type: 'error'
        }]);
    },

    openRuntime: function openRuntime() {
        // Close opened window
        this.closeRuntime();
        this.window = window.open('runtime/index.html', 'runtime', 'dependent,dialog,height=480,width=640', true);

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
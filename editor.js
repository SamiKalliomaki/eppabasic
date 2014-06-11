/// <reference path="compiler/parser.js" />
/// <reference path="compiler/compiler.js" />

function Editor() {
    this.codeBox = document.getElementById('code');
    this.errBox = document.getElementById('errBox');
}

Editor.prototype = {
    parse: function parse() {
        //         var parser = new Parser(this.codeBox.value);
        var parser = new Parser(editor.getValue());
        try {
            this.ast = parser.parse();
        } catch (e) {
            this.errBox.innerHTML = e.message;
            throw e;
        }
    },
    compile: function compile() {
        var compiler = new Compiler(this.ast);

        // Drawing functions
        compiler.defineJsFunction('CLEARCOLOR', [Types.Integer, Types.Integer, Types.Integer], 'clearColor');
        compiler.defineJsFunction('LINECOLOR', [Types.Integer, Types.Integer, Types.Integer], 'lineColor');
        compiler.defineJsFunction('FILLCOLOR', [Types.Integer, Types.Integer, Types.Integer], 'fillColor');
        compiler.defineJsFunction('LINE', [Types.Integer, Types.Integer, Types.Integer, Types.Integer], 'line');
        compiler.defineJsFunction('CIRCLE', [Types.Integer, Types.Integer, Types.Integer], 'circle');
        compiler.defineJsFunction('FILLCIRCLE', [Types.Integer, Types.Integer, Types.Integer], 'fillCircle');
        compiler.defineJsFunction('RECT', [Types.Integer, Types.Integer, Types.Integer, Types.Integer], 'rect');
        compiler.defineJsFunction('FILLRECT', [Types.Integer, Types.Integer, Types.Integer, Types.Integer], 'fillRect');
        compiler.defineJsFunction('DOT', [Types.Integer, Types.Integer], 'dot');
        compiler.defineJsFunction('CLEAR', [], 'clear');
        compiler.defineJsFunction('DRAWSCREEN', [], 'drawScreen', undefined, false);

        compiler.defineJsFunction('TEXT', [Types.Integer, Types.Integer, Types.String], 'text');

        //compiler.defineJsFunction('SHOWCONSOLE', [], 'showConsole');
        //compiler.defineJsFunction('HIDECONSOLE', [], 'hideConsole');

        // Mathematical functions
        compiler.defineJsFunction('DBL', [Types.Integer], 'dbl', Types.Double);
        compiler.defineJsFunction('INT', [Types.Double], 'int', Types.Integer);
        compiler.defineJsFunction('SIN', [Types.Double], 'sin', Types.Double);
        compiler.defineJsFunction('COS', [Types.Double], 'cos', Types.Double);

        compiler.defineJsFunction('SQRT', [Types.Double], 'sqrt', Types.Double);

        compiler.defineJsFunction('RANDOM', [], 'random', Types.Double);
        compiler.defineJsFunction('RANDINT', [Types.Integer, Types.Integer], 'randint', Types.Integer);


        // Time functions
        compiler.defineJsFunction('HOURS', [], 'hours', Types.Integer);
        compiler.defineJsFunction('MINUTES', [], 'minutes', Types.Integer);
        compiler.defineJsFunction('SECONDS', [], 'seconds', Types.Integer);
        compiler.defineJsFunction('MILLISECONDS', [], 'milliseconds', Types.Integer);

        // Input
        compiler.defineJsFunction('KEYDOWN', [Types.Integer], 'keyDown', Types.Integer);
        compiler.defineJsFunction('KEYUP', [Types.Integer], 'keyUp', Types.Integer);
        compiler.defineJsFunction('KEYHIT', [Types.Integer], 'keyHit', Types.Integer);
        compiler.defineJsFunction('MOUSEX', [], 'mouseX', Types.Integer);
        compiler.defineJsFunction('MOUSEY', [], 'mouseY', Types.Integer);
        compiler.defineJsFunction('MOUSEDOWN', [Types.Integer], 'mouseDown', Types.Integer);

        // Output
        compiler.defineJsFunction('PRINT', [Types.String], 'print');
        compiler.defineJsFunction('PRINT', [Types.Double], 'printDbl');
        compiler.defineJsFunction('PRINT', [Types.Integer], 'printInt');


        try {
            this.compiled = compiler.compile();

            //document.getElementById('codeBox').innerHTML = this.compiled;
            this.errBox.innerHTML = "";
        } catch (e) {
            this.errBox.innerHTML = e.message;
            throw e;
        }
    },

    openRuntime: function openRuntime() {
        if (!this.compiled)
            this.compile();

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
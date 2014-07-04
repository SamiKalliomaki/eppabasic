/// <reference path="../compiler/parser.js" />
/// <reference path="../compiler/operators.js" />
/// <reference path="../compiler/types.js" />
/// <reference path="../compiler/compiler.js" />

function Editor(editorName, errBox) {
    this.editorName = editorName;
    this.errBox = errBox;

    this.types = new TypeContainer();
    this.operators = new OperatorContainer(this.types);
    this.operators.addDefaultOperators();

    this.ace = ace.edit(editorName);
    this.ace.getSession().setMode("mode/eppabasic");
}

Editor.prototype = {
    getCode: function getCode() {
        return this.ace.getValue();
    },
    setCode: function setCode(code) {
        this.ace.setValue(code);
    },
    parse: function parse() {
        var parser = new Parser(this.ace.getValue(), this.operators, this.types);
        try {
            this.ast = parser.parse();
        } catch (e) {
            this.errBox.innerHTML = e.message;
            throw e;
        }
    },
    compile: function compile() {
        var compiler = new Compiler(this.ast, this.operators, this.types);

        //compiler.defineJsFunction('line', true, 'Line', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        //compiler.defineJsFunction('atomic', true, 'atom', [this.types.Integer], this.types.Integer, true);
        //compiler.defineJsFunction('nonAtomic', true, 'ntom', [this.types.Integer], this.types.Integer, false);

        //// Drawing functions
        compiler.defineJsFunction('clearColor', true, 'ClearColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('lineColor', true, 'LineColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('fillColor', true, 'FillColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('line', true, 'Line', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('circle', true, 'Circle', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('fillCircle', true, 'FillCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('rect', true, 'Rect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('fillRect', true, 'FillRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('dot', true, 'Dot', [this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('clear', true, 'Clear', []);
        compiler.defineJsFunction('drawScreen', true, 'DrawScreen', [], undefined, false);

        //compiler.defineJsFunction('TEXT', [Types.Integer, Types.Integer, Types.String], 'text');

        ////compiler.defineJsFunction('SHOWCONSOLE', [], 'showConsole');
        ////compiler.defineJsFunction('HIDECONSOLE', [], 'hideConsole');

        //// Mathematical functions
        //compiler.defineJsFunction('DBL', [Types.Integer], 'dbl', Types.Double);
        //compiler.defineJsFunction('INT', [Types.Double], 'int', Types.Integer);
        //compiler.defineJsFunction('SIN', [Types.Double], 'sin', Types.Double);
        //compiler.defineJsFunction('COS', [Types.Double], 'cos', Types.Double);

        //compiler.defineJsFunction('SQRT', [Types.Double], 'sqrt', Types.Double);

        //compiler.defineJsFunction('RANDOM', [], 'random', Types.Double);
        //compiler.defineJsFunction('RANDINT', [Types.Integer, Types.Integer], 'randint', Types.Integer);


        //// Time functions
        //compiler.defineJsFunction('HOURS', [], 'hours', Types.Integer);
        //compiler.defineJsFunction('MINUTES', [], 'minutes', Types.Integer);
        //compiler.defineJsFunction('SECONDS', [], 'seconds', Types.Integer);
        //compiler.defineJsFunction('MILLISECONDS', [], 'milliseconds', Types.Integer);

        //// Input
        //compiler.defineJsFunction('KEYDOWN', [Types.Integer], 'keyDown', Types.Integer);
        //compiler.defineJsFunction('KEYUP', [Types.Integer], 'keyUp', Types.Integer);
        //compiler.defineJsFunction('KEYHIT', [Types.Integer], 'keyHit', Types.Integer);
        //compiler.defineJsFunction('MOUSEX', [], 'mouseX', Types.Integer);
        //compiler.defineJsFunction('MOUSEY', [], 'mouseY', Types.Integer);
        //compiler.defineJsFunction('MOUSEDOWN', [Types.Integer], 'mouseDown', Types.Integer);

        //// Output
        //compiler.defineJsFunction('PRINT', [Types.String], 'print');
        //compiler.defineJsFunction('PRINT', [Types.Double], 'printDbl');
        //compiler.defineJsFunction('PRINT', [Types.Integer], 'printInt');


        try {
            // Do checkings here
            // TODO Move elsewhere
            new Typechecker(this.ast, compiler.functions, this.operators, this.types).check();
            new Atomicchecker(this.ast, compiler.functions).check();


            this.compiled = compiler.compile();

            //document.getElementById('codeBox').innerHTML = this.compiled;
            this.errBox.innerHTML = "";
        } catch (e) {
            this.errBox.innerHTML = e.message;
            throw e;
        }
    },

    openRuntime: function openRuntime() {
        //if (!this.compiled)
        //    this.compile();

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
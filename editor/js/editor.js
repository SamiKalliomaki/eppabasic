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

        //// Drawing functions
        compiler.defineJsFunction('env.clearColor', true, 'ClearColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.lineColor', true, 'DrawColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.lineColor', true, 'LineColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.fillColor', true, 'FillColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.line', true, 'DrawLine', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.line', true, 'Line', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.circle', true, 'DrawCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.circle', true, 'Circle', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.fillCircle', true, 'FillCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.rect', true, 'DrawRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.rect', true, 'Rect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.fillRect', true, 'FillRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.dot', true, 'DrawDot', [this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.dot', true, 'Dot', [this.types.Integer, this.types.Integer]);
        compiler.defineJsFunction('env.clear', true, 'ClearScreen', []);
        compiler.defineJsFunction('env.clear', true, 'Clear', []);
        compiler.defineJsFunction('env.drawScreen', true, 'DrawScreen', [], undefined, false);
        //compiler.defineJsFunction('env.fullScreen', true, 'FullScreen', []);                  // Reserved for a better day

        //compiler.defineJsFunction('TEXT', [Types.Integer, Types.Integer, Types.String], 'text');

        ////compiler.defineJsFunction('SHOWCONSOLE', [], 'showConsole');
        ////compiler.defineJsFunction('HIDECONSOLE', [], 'hideConsole');

        //// Mathematical functions
        compiler.defineJsFunction('stdlib.Math.sin', true, 'Sin', [this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.cos', true, 'Cos', [this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.tan', true, 'Tan', [this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.sqrt', true, 'Sqr', [this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.abs', true, 'Abs', [this.types.Integer], this.types.Integer);
        compiler.defineJsFunction('stdlib.Math.abs', true, 'Abs', [this.types.Double], this.types.Double);

        compiler.defineJsFunction('stdlib.Math.min', true, 'Min', [this.types.Double, this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.min', true, 'Min', [this.types.Integer, this.types.Integer], this.types.Integer);
        compiler.defineJsFunction('stdlib.Math.max', true, 'Max', [this.types.Double, this.types.Double], this.types.Double);
        compiler.defineJsFunction('stdlib.Math.max', true, 'Max', [this.types.Integer, this.types.Integer], this.types.Integer);

        
        compiler.defineJsFunction('env.rand', true, 'Rand', [this.types.Double, this.types.Double], this.types.Double);
        
        //compiler.defineJsFunction('SQRT', [Types.Double], 'sqrt', Types.Double);

        //compiler.defineJsFunction('RANDOM', [], 'random', Types.Double);
        //compiler.defineJsFunction('RANDINT', [Types.Integer, Types.Integer], 'randint', Types.Integer);


        //// Time functions
        compiler.defineJsFunction('env.hours', true, 'Hours', [], this.types.Integer);
        compiler.defineJsFunction('env.minutes', true, 'Minutes', [], this.types.Integer);
        compiler.defineJsFunction('env.seconds', true, 'Seconds', [], this.types.Integer);
        compiler.defineJsFunction('env.milliseconds', true, 'MilliSeconds', [], this.types.Integer);

        //// Input
        compiler.defineJsFunction('env.keyDown', true, 'KeyDown', [this.types.Integer], this.types.Boolean);
        compiler.defineJsFunction('env.keyUp', true, 'KeyUp', [this.types.Integer], this.types.Boolean);
        compiler.defineJsFunction('env.keyHit', true, 'KeyHit', [this.types.Integer], this.types.Boolean);
        compiler.defineJsFunction('env.mouseX', true, 'MouseX', [], this.types.Integer);
        compiler.defineJsFunction('env.mouseY', true, 'MouseY', [], this.types.Integer);
        compiler.defineJsFunction('env.mouseDown', true, 'MouseDown', [this.types.Integer], this.types.Boolean);

        //// Output
        compiler.defineJsFunction('env.printInt', true, 'Print', [this.types.Integer]);
        compiler.defineJsFunction('env.printDbl', true, 'Print', [this.types.Double]);
        compiler.defineJsFunction('env.printStr', true, 'Print', [this.types.String]);
        //compiler.defineJsFunction('PRINT', [Types.String], 'print');
        //compiler.defineJsFunction('PRINT', [Types.Double], 'printDbl');
        //compiler.defineJsFunction('PRINT', [Types.Integer], 'printInt');

        //// Casting
        compiler.defineJsFunction('__int', false, 'Int', [this.types.Integer], this.types.Integer);


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
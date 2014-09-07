
define(['./types', './operators', './compiler', './parser', './typechecker', './atomicchecker'], function (TypeContainer, OperatorContainer, Compiler, Parser, Typechecker, Atomicchecker) {
    function CompilationUnit(code) {
        this.code = code;
        this.errors = [];
    }

    CompilationUnit.prototype = {
    }

    function Toolchain() {
        this.types = new TypeContainer();
        this.operators = new OperatorContainer(this.types);
        this.operators.addDefaultOperators();
    }

    Toolchain.prototype = {
        getCompilationUnit: function (code) {
            return new CompilationUnit(code);
        },

        parse: function (compilationUnit) {
            var parser = this.getParser(compilationUnit.code);

            try {
                compilationUnit.ast = parser.parse();
            } catch (e) {
                compilationUnit.errors = parser.errors;
                throw e;
            }
            compilationUnit.errors = parser.errors;

            if (parser.errors.length === 0) {
                compilationUnit.compiler = this.getCompiler(compilationUnit.ast);
            }
        },

        check: function (compilationUnit) {
            var ast = compilationUnit.ast;
            var compiler = compilationUnit.compiler;

            if (compilationUnit.errors.length === 0) {
                var typechecker = new Typechecker(ast, compiler.functions, this.operators, this.types);
                try {
                    typechecker.check();
                } catch (e) {
                    Array.prototype.push.apply(compilationUnit.errors, typechecker.errors);
                    throw e;
                }
                Array.prototype.push.apply(compilationUnit.errors, typechecker.errors);
            }
            if (compilationUnit.errors.length === 0) {
                new Atomicchecker(ast, compiler.functions).check();
            }
        },

        compile: function (compilationUnit) {
            return compilationUnit.compiler.compile();
        },

        getParser: function (code) {
            return new Parser(code, this.operators, this.types);
        },

        getCompiler: function (ast) {
            ast = ast || { nodes: [] };
            var compiler = new Compiler(ast, this.operators, this.types);
            this.defineFunctions(compiler);

            return compiler;
        },

        defineFunctions: function (compiler) {
            //// Drawing functions
            compiler.defineJsFunction('env.clearColor', true, 'ClearColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineColor', true, 'DrawColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineColor', true, 'LineColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineWidth', true, 'DrawWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.fillColor', true, 'FillColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.line', true, 'DrawLine', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.line', true, 'Line', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.circle', true, 'DrawCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.circle', true, 'Circle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillCircle', true, 'FillCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.rect', true, 'DrawRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.rect', true, 'Rect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillRect', true, 'FillRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.triangle', true, 'Triangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.triangle', true, 'DrawTriangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillTriangle', true, 'FillTriangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.dot', true, 'DrawDot', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.dot', true, 'Dot', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.clear', true, 'ClearScreen', []);
            compiler.defineJsFunction('env.clear', true, 'Clear', []);
            compiler.defineJsFunction('env.drawScreen', true, 'DrawScreen', [], undefined, false);

            compiler.defineJsFunction('env.drawText', true, 'DrawText', [this.types.Integer, this.types.Integer, this.types.String]);
            compiler.defineJsFunction('env.drawText', true, 'DrawText', [this.types.Integer, this.types.Integer, this.types.String, this.types.Integer]);
            compiler.defineJsFunction('env.textColor', true, 'TextColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.textFont', true, 'TextFont', [this.types.String]);
            compiler.defineJsFunction('env.textSize', true, 'TextSize', [this.types.Integer]);
            compiler.defineJsFunction('env.textAlign', true, 'TextAlign', [this.types.Integer]);

            //compiler.defineJsFunction('env.message', true, 'Message', [this.types.String]);
            //compiler.defineJsFunction('env.askNumber', true, 'AskNumber', [this.types.String], this.types.Double);
            //compiler.defineJsFunction('env.askText', true, 'AskText', [this.types.String], this.types.String);
            //compiler.defineJsFunction('env.askNumber', true, 'InputNumber', [this.types.String], this.types.Double);
            //compiler.defineJsFunction('env.askText', true, 'InputText', [this.types.String], this.types.String);
            //compiler.defineJsFunction('env.inputCancel', true, 'InputCancel', [], this.types.Boolean);
            compiler.defineJsFunction('env.setWindowTitle', true, 'WindowTitle', [this.types.String]);
            compiler.defineJsFunction('env.getWindowTitle', true, 'WindowTitle', [], this.types.String);

            //// Screen size
            compiler.defineJsFunction('env.getWindowWidth', true, 'WindowWidth', [], this.types.Integer);
            compiler.defineJsFunction('env.setWindowWidth', true, 'WindowWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.getWindowHeight', true, 'WindowHeight', [], this.types.Integer);
            compiler.defineJsFunction('env.setWindowHeight', true, 'WindowHeight', [this.types.Integer]);
            compiler.defineJsFunction('env.setWindowSize', true, 'WindowSize', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.getScreenWidth', true, 'ScreenWidth', [], this.types.Integer);
            compiler.defineJsFunction('env.setScreenWidth', true, 'ScreenWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.getScreenHeight', true, 'ScreenHeight', [], this.types.Integer);
            compiler.defineJsFunction('env.setScreenHeight', true, 'ScreenHeight', [this.types.Integer]);
            compiler.defineJsFunction('env.setScreenSize', true, 'ScreenSize', [this.types.Integer, this.types.Integer]);


            //compiler.defineJsFunction('env.fullScreen', true, 'FullScreen', []);                  // Reserved for a better day


            //// Memory functions
            compiler.defineJsFunction('__peek32', false, 'Peek32', [this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('__poke32', false, 'Poke32', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('__memsize', false, 'MemorySize', [], this.types.Integer);

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

            compiler.defineJsFunction('stdlib.Math.floor', true, 'Floor', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.ceil', true, 'Ceil', [this.types.Double], this.types.Double);

            compiler.defineJsFunction('env.randInt', true, 'Rnd', [this.types.Integer, this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('env.randDbl', true, 'Rnd', [], this.types.Double);
            compiler.defineJsFunction('env.randomize', true, 'Randomize', [this.types.Double]);

            compiler.defineJsFunction('env.round', true, 'Round', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('env.round2', true, 'Round', [this.types.Double, this.types.Integer], this.types.Double);


            //// String functions
            compiler.defineJsFunction('__strasc', false, 'Asc', [this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.chr', true, 'Chr', [this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.instr', true, 'InStr', [this.types.String, this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.instr2', true, 'InStr', [this.types.Integer, this.types.String, this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.lcase', true, 'LCase', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.left', true, 'Left', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.len', true, 'Len', [this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.match', true, 'Match', [this.types.String, this.types.String], this.types.Boolean);
            compiler.defineJsFunction('env.mid', true, 'Mid', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.mid', true, 'Mid', [this.types.String, this.types.Integer, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.repeat', true, 'Repeat', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.replace', true, 'Replace', [this.types.String, this.types.String, this.types.String], this.types.String);
            compiler.defineJsFunction('env.reverse', true, 'Reverse', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.right', true, 'Right', [this.types.String, this.types.Integer], this.types.String);
            //compiler.defineJsFunction('env.rot13', true, 'Rot13', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.trim', true, 'Trim', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.ucase', true, 'UCase', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.val', true, 'Val', [this.types.String], this.types.Double);

            //// Time functions
            compiler.defineJsFunction('env.timer', true, 'Timer', [], this.types.Double);
            compiler.defineJsFunction('env.wait', true, 'Wait', [this.types.Double], undefined, false);

            compiler.defineJsFunction('env.year', true, 'Year', [], this.types.Integer);
            compiler.defineJsFunction('env.month', true, 'Month', [], this.types.Integer);
            compiler.defineJsFunction('env.day', true, 'Day', [], this.types.Integer);
            compiler.defineJsFunction('env.weekday', true, 'Weekday', [], this.types.Integer);
            compiler.defineJsFunction('env.hour', true, 'Hour', [], this.types.Integer);
            compiler.defineJsFunction('env.minute', true, 'Minute', [], this.types.Integer);
            compiler.defineJsFunction('env.second', true, 'Second', [], this.types.Integer);
            compiler.defineJsFunction('env.millisecond', true, 'MilliSecond', [], this.types.Integer);
            compiler.defineJsFunction('env.time', true, 'Time', [], this.types.String);
            compiler.defineJsFunction('env.date', true, 'Date', [], this.types.String);


            //// Input
            compiler.defineJsFunction('env.keyDown', true, 'KeyDown', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.keyUp', true, 'KeyUp', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.keyHit', true, 'KeyHit', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseX', true, 'MouseX', [], this.types.Integer);
            compiler.defineJsFunction('env.mouseY', true, 'MouseY', [], this.types.Integer);
            compiler.defineJsFunction('env.mouseDown', true, 'MouseDown', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseUp', true, 'MouseUp', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseHit', true, 'MouseHit', [this.types.Integer], this.types.Boolean);

            //// Output
            compiler.defineJsFunction('env.print', true, 'Print', [this.types.String]);
            compiler.defineJsFunction('env.printLocation', true, 'PrintLocation', [this.types.Integer, this.types.Integer]);

            //// Casting
            compiler.defineJsFunction('__int', false, 'Int', [this.types.Integer], this.types.Integer);
            //compiler.defineJsFunction('env.integerToString', true, 'Str', [this.types.Integer], this.types.String);
            //compiler.defineJsFunction('env.doubleToString', true, 'Str', [this.types.Double], this.types.String);
        }
    }

    return Toolchain;
});
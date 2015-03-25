
define(['require', './types', './operators', './compiler', './parser', './typechecker', './atomicchecker', './variablescopelist', './constants'], function (require, TypeContainer, OperatorContainer, Compiler, Parser, Typechecker, Atomicchecker, VariableScopeList) {
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
                var typechecker = new Typechecker(ast, compiler.functions, require('./constants')(this.types), this.operators, this.types);
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

        variableScopes: function variableScopes(compilationUnit) {
            var ast = compilationUnit.ast;
            return new VariableScopeList(ast);
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
            compiler.defineJsFunction('env.clearColor', true, 'Sub ClearColor(Integer,Integer,Integer)', 'ClearColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineColor', true, 'Sub LineColor(Integer,Integer,Integer)', 'DrawColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineColor', true, 'Sub LineColor(Integer,Integer,Integer)', 'LineColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.lineWidth', true, 'Sub LineWidth(Integer)', 'DrawWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.fillColor', true, 'Sub FillColor(Integer,Integer,Integer)', 'FillColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.line', true, 'Sub DrawLine(Integer,Integer,Integer,Integer)', 'DrawLine', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.line', true, 'Sub DrawLine(Integer,Integer,Integer,Integer)', 'Line', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.circle', true, 'Sub DrawCircle(Integer,Integer,Integer)', 'DrawCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.circle', true, 'Sub DrawCircle(Integer,Integer,Integer)', 'Circle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillCircle', true, 'Sub FillCircle(Integer,Integer,Integer)', 'FillCircle', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.rect', true, 'Sub DrawRect(Integer,Integer,Integer,Integer)', 'DrawRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.rect', true, 'Sub DrawRect(Integer,Integer,Integer,Integer)', 'Rect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillRect', true, 'Sub FillRect(Integer,Integer,Integer,Integer)', 'FillRect', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.triangle', true, 'Sub DrawTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', 'Triangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.triangle', true, 'Sub DrawTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', 'DrawTriangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.fillTriangle', true, 'Sub FillTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', 'FillTriangle', [this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.dot', true, 'Sub DrawDot(Integer,Integer)', 'DrawDot', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.dot', true, 'Sub DrawDot(Integer,Integer)', 'Dot', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.clear', true, 'Sub ClearScreen()', 'ClearScreen', []);
            compiler.defineJsFunction('env.clear', true, 'Sub ClearScreen()', 'Clear', []);
            compiler.defineJsFunction('env.drawScreen', true, 'Sub DrawScreen()', 'DrawScreen', [], undefined, false);

            compiler.defineJsFunction('env.drawText', true, 'Sub DrawText(Integer,Integer,String)', 'DrawText', [this.types.Integer, this.types.Integer, this.types.String]);
            compiler.defineJsFunction('env.drawText', true, 'Sub DrawText(Integer,Integer,String,Integer)', 'DrawText', [this.types.Integer, this.types.Integer, this.types.String, this.types.Integer]);
            compiler.defineJsFunction('env.textColor', true, 'Sub TextColor(Integer,Integer,Integer)', 'TextColor', [this.types.Integer, this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.textFont', true, 'Sub TextFont(String)', 'TextFont', [this.types.String]);
            compiler.defineJsFunction('env.textSize', true, 'Sub TextSize(Integer)', 'TextSize', [this.types.Integer]);
            compiler.defineJsFunction('env.textAlign', true, 'Sub TextAlign(Integer)', 'TextAlign', [this.types.Integer]);

            compiler.defineJsFunction('env.message', true, 'Sub Message(String)', 'Message', [this.types.String], undefined, false);
            compiler.defineJsFunction('env.askNumber', true, 'Function AskNumber(String) As Double', 'AskNumber', [this.types.String], this.types.Double, false);
            compiler.defineJsFunction('env.askText', true, 'Function AskText(String) As String', 'AskText', [this.types.String], this.types.String, false);
            compiler.defineJsFunction('env.askNumber', true, 'Function AskNumber(String) As Double', 'InputNumber', [this.types.String], this.types.Double, false);
            compiler.defineJsFunction('env.askText', true, 'Function AskText(String) As String', 'InputText', [this.types.String], this.types.String, false);
            //compiler.defineJsFunction('env.inputCancel', true, 'InputCancel', [], this.types.Boolean);
            compiler.defineJsFunction('env.setWindowTitle', true, 'Sub SetWindowTitle(String)', 'WindowTitle', [this.types.String]);
            compiler.defineJsFunction('env.getWindowTitle', true, 'Function GetWindowTitle() As String', 'WindowTitle', [], this.types.String);

            //// Screen size
            compiler.defineJsFunction('env.getWindowWidth', true, 'Function GetWindowWidth() As Integer', 'WindowWidth', [], this.types.Integer);
            compiler.defineJsFunction('env.setWindowWidth', true, 'Sub SetWindowWidth(Integer)', 'WindowWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.getWindowHeight', true, 'Function GetWindowHeight() As Integer', 'WindowHeight', [], this.types.Integer);
            compiler.defineJsFunction('env.setWindowHeight', true, 'Sub SetWindowHeight(Integer)', 'WindowHeight', [this.types.Integer]);
            compiler.defineJsFunction('env.setWindowSize', true, 'Sub SetWindowSize(Integer,Integer)', 'WindowSize', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.getCanvasWidth', true, 'Function GetcanvasWidth() As Integer', 'CanvasWidth', [], this.types.Integer);
            compiler.defineJsFunction('env.setCanvasWidth', true, 'Sub SetCanvasWidth(Integer)', 'CanvasWidth', [this.types.Integer]);
            compiler.defineJsFunction('env.getCanvasHeight', true, 'Function GetCanvasHeight() As Integer', 'CanvasHeight', [], this.types.Integer);
            compiler.defineJsFunction('env.setCanvasHeight', true, 'Sub SetCanvasHeight(Integer)', 'CanvasHeight', [this.types.Integer]);
            compiler.defineJsFunction('env.setCanvasSize', true, 'Sub SetCanvasSize(Integer,Integer)', 'CanvasSize', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('env.setLineSpacing', true, 'Sub LineSpacing(Double)', 'LineSpacing', [this.types.Integer]);

            //// Memory functions
            compiler.defineJsFunction('__peek32', false, '', 'Peek32', [this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('__poke32', false, '', 'Poke32', [this.types.Integer, this.types.Integer]);
            compiler.defineJsFunction('__memsize', false, '', 'MemorySize', [], this.types.Integer);

            //// Mathematical functions
            compiler.defineJsFunction('stdlib.Math.sin', true, '', 'Sin', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.cos', true, '', 'Cos', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.tan', true, '', 'Tan', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.sqrt', true, '', 'Sqrt', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.abs', true, '', 'Abs', [this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('stdlib.Math.abs', true, '', 'Abs', [this.types.Double], this.types.Double);

            compiler.defineJsFunction('stdlib.Math.min', true, '', 'Min', [this.types.Double, this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.min', true, '', 'Min', [this.types.Integer, this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('stdlib.Math.max', true, '', 'Max', [this.types.Double, this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.max', true, '', 'Max', [this.types.Integer, this.types.Integer], this.types.Integer);

            compiler.defineJsFunction('stdlib.Math.floor', true, '', 'Floor', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('stdlib.Math.ceil', true, '', 'Ceil', [this.types.Double], this.types.Double);

            compiler.defineJsFunction('env.randInt', true, 'Function Rnd(Integer,Integer) As Integer', 'Rnd', [this.types.Integer, this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('env.randDbl', true, 'Function Rnd() As Double', 'Rnd', [], this.types.Double);
            compiler.defineJsFunction('env.randomize', true, 'Sub Randomize(Double)', 'Randomize', [this.types.Double]);

            compiler.defineJsFunction('env.round', true, 'Function Round(Double) As Double', 'Round', [this.types.Double], this.types.Double);
            compiler.defineJsFunction('env.round2', true, 'Function Round(Double,Integer) As Double', 'Round', [this.types.Double, this.types.Integer], this.types.Double);

            //// String functions
            compiler.defineJsFunction('__strasc', false, '', 'Asc', [this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.chr', true, 'Function Chr(Integer) As String', 'Chr', [this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.instr', true, 'Function InStr(String,String) As Integer', 'InStr', [this.types.String, this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.instr2', true, 'Function InStr(Integer,String,String) As Integer', 'InStr', [this.types.Integer, this.types.String, this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.lcase', true, 'Function LCase(String) As String', 'LCase', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.left', true, 'Function Left(String,Integer) As String', 'Left', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.len', true, 'Function Len(String) As Integer', 'Len', [this.types.String], this.types.Integer);
            compiler.defineJsFunction('env.match', true, 'Function Match(String,String) As Boolean', 'Match', [this.types.String, this.types.String], this.types.Boolean);
            compiler.defineJsFunction('env.mid', true, 'Function Mid(String,Integer) As String', 'Mid', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.mid', true, 'Function Mid(String,Integer,Integer) As String', 'Mid', [this.types.String, this.types.Integer, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.repeat', true, 'Function Repeat(String,Integer) As String', 'Repeat', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.replace', true, 'Function Replace(String,String,String) As String', 'Replace', [this.types.String, this.types.String, this.types.String], this.types.String);
            compiler.defineJsFunction('env.reverse', true, 'Function Reverse(String) As String', 'Reverse', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.right', true, 'Function Right(String,Integer) As String', 'Right', [this.types.String, this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.rot13', true, 'Function Rot13(String) As String', 'Rot13', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.trim', true, 'Function Trim(String) As String', 'Trim', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.ucase', true, 'Function UCase(String) As String', 'UCase', [this.types.String], this.types.String);
            compiler.defineJsFunction('env.val', true, 'Function Val(String) As Double', 'Val', [this.types.String], this.types.Double);

            //// Time functions
            compiler.defineJsFunction('env.timer', true, 'Function Timer() As Double', 'Timer', [], this.types.Double);
            compiler.defineJsFunction('env.wait', true, 'Sub Wait(Double)', 'Wait', [this.types.Double], undefined, false);

            compiler.defineJsFunction('env.year', true, 'Function Year() As Integer', 'Year', [], this.types.Integer);
            compiler.defineJsFunction('env.month', true, 'Function Month() As Integer', 'Month', [], this.types.Integer);
            compiler.defineJsFunction('env.day', true, 'Function Day() As Integer', 'Day', [], this.types.Integer);
            compiler.defineJsFunction('env.weekday', true, 'Function Weekday() As Integer', 'Weekday', [], this.types.Integer);
            compiler.defineJsFunction('env.hour', true, 'Function Hour() As Integer', 'Hour', [], this.types.Integer);
            compiler.defineJsFunction('env.minute', true, 'Function Minute() As Integer', 'Minute', [], this.types.Integer);
            compiler.defineJsFunction('env.second', true, 'Function Second() As Integer', 'Second', [], this.types.Integer);
            compiler.defineJsFunction('env.millisecond', true, 'Function MilliSecond() As Integer', 'MilliSecond', [], this.types.Integer);
            compiler.defineJsFunction('env.time', true, 'Function Time() As String', 'Time', [], this.types.String);
            compiler.defineJsFunction('env.date', true, 'Function Date() As String', 'Date', [], this.types.String);

            //// Input
            compiler.defineJsFunction('env.keyDown', true, 'Function KeyDown(Integer) As Boolean', 'KeyDown', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.keyUp', true, 'Function KeyUp(Integer) As Boolean', 'KeyUp', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.keyHit', true, 'Function KeyHit(Integer) As Boolean', 'KeyHit', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseX', true, 'Function MouseX() As Integer', 'MouseX', [], this.types.Integer);
            compiler.defineJsFunction('env.mouseY', true, 'Function MouseY() As Integer', 'MouseY', [], this.types.Integer);
            compiler.defineJsFunction('env.mouseDown', true, 'Function MouseDown(Integer) As Boolean', 'MouseDown', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseUp', true, 'Function MouseUp(Integer) As Boolean', 'MouseUp', [this.types.Integer], this.types.Boolean);
            compiler.defineJsFunction('env.mouseHit', true, 'Function MouseHit(Integer) As Boolean', 'MouseHit', [this.types.Integer], this.types.Boolean);

            //// Output
            compiler.defineJsFunction('env.print', true, 'Sub Print(String)', 'Print', [this.types.String]);
            compiler.defineJsFunction('env.printLocation', true, 'Sub PrintLocation(Integer,Integer)', 'PrintLocation', [this.types.Integer, this.types.Integer]);

            //// Casting
            compiler.defineJsFunction('__int', false, '', 'Int', [this.types.Integer], this.types.Integer);
            compiler.defineJsFunction('env.integerToString', true, 'Function Str(Integer) As String', 'Str', [this.types.Integer], this.types.String);
            compiler.defineJsFunction('env.doubleToString', true, 'Function Str(Number) As String', 'Str', [this.types.Double], this.types.String);

            //// Code flow functions
            compiler.defineJsFunction('env.end', true, 'Sub End()', 'End', [], undefined, false);
            compiler.defineJsFunction('env.restart', true, 'Sub Restart()', 'Restart', [], undefined, false);
        }
    }

    return Toolchain;
});

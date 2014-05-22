/// <reference path="typechecker.js" />
/// <reference path="atomicchecker.js" />

function Compiler(ast) {
    this.ast = ast;
    this.functions = [];
    this.buf = [];

    // For functions
    this.createdFunctions = [];
    this.nextFreeFunction = 0;
}

Compiler.prototype = {
    ftableName: '$fTable',
    fprefix: '$f',

    /*
     * Adds line to the buffer
     */
    buffer: function buffer(data) {
        this.buf.push(data);
    },

    /*
     * Defines a native function
     */
    defineJsFunction: function defineJsFunction(name, paramTypes, jsname, returnType, atomic, entry) {
        if (atomic !== false)
            atomic = true;
        if (!entry) {
            // Define an entry point
            entry = this.createFunction(name);

            var paramSize = 0;
            paramTypes.forEach(function each(param) {
                paramSize += this.getTypeSize(param);
            }.bind(this));

            entry.nodes.push(jsname + '(SP|0);');

            var retSize = 0;
            if (returnType)
                retSize = this.getTypeSize(returnType);
            entry.nodes.push('SP = (SP - ' + (paramSize - retSize) + ')|0;');
            entry.nodes.push('CS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
        }
        if (!atomic)
            entry.nativeBreaking = true;
        this.functions.push({
            name: name,
            paramTypes: paramTypes,
            jsname: jsname,
            returnType: returnType,
            atomic: atomic,
            entry: entry
        });
    },

    /*
     * Compiles ast tree into asm.js
     */
    compile: function compile() {
        // Find user defined functions
        this.ast.nodes.forEach(function each(val) {
            if (val.nodeType === 'FunctionDefinition') {
                var paramTypes = val.params.map(function map(val) {
                    return val.type;
                })
                this.defineJsFunction(val.name, paramTypes, undefined, val.type, undefined, val.entry = this.createFunction(val.name));
            }
        }.bind(this));

        // Do typechecking
        var checker = new Typechecker(this.ast, this.functions);
        checker.check();
        checker = new Atomicchecker(this.ast, this.functions);
        checker.check();

        // Compile functions...
        this.ast.nodes.forEach(function each(val) {
            if (val.nodeType === 'FunctionDefinition')
                this.compileFunctionDefinition(val);
        }.bind(this));
        // ... and then the main code
        var entry = this.createFunction('MAIN');
        var context = {
            name: 'MAIN',
            curFunc: entry,
            spOffset: 0
        };
        this.compileBlock(this.ast, context, true);
        // Finally call stop function forever
        var stopFunction = this.createFunction('END');
        stopFunction.nativeBreaking = true;
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + stopFunction.index + ';');

        return ('function Program(stdlib, env, heap) {\n'
                + '"use asm";\n'
                + 'var MEMS32 = new stdlib.Int32Array(heap);\n'
                + 'var MEMU32 = new stdlib.Uint32Array(heap);\n'
                + 'var MEMF32 = new stdlib.Float32Array(heap);\n'
                + 'var MEMF64 = new stdlib.Float64Array(heap);\n'
                + 'var imul = stdlib.Math.imul;\n'
                + 'var __log = env.__log;\n'                                        // Logger function TODO Revove
                + 'var SP = 0;\n'                                                   // Stack pointer
                + 'var CS = 0;\n'                                                   // Call stack pointer
                + this.compileSystemFunctionDefinitions() + '\n'

                + 'function next() {\n'
                + '\twhile(' + this.ftableName + '[MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] & ' + this.getFTableMask() + ']()|0);\n'
                + '}\n'

                + 'function init() {\n'
                + '\tSP = 0;\n'
                + '\tCS = 1024;\n'
                + '\tMEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + entry.index + ';\n'
                + '}\n'

                + 'function sp() {\n'
                + '\treturn SP|0;\n'
                + '}\n'
                + 'function cs() {\n'
                + '\treturn CS|0;\n'
                + '}\n'

                + this.createFunctionsCode() + '\n'
                + this.createFTable() + '\n'
                + 'return {\n'
                + '\tinit: init,\n'
                + '\treset: init,\n'
                + '\tnext: next,\n'
                + '\tsp: sp,\n'
                + '\tcs: cs\n'
                + '};\n'
                + '}'
            )

        this.buf.join('\n');
    },

    /*
     * Compiles an user defined function
     */
    compileFunctionDefinition: function compileFunctionDefinition(def) {
        var context = {
            name: def.name,
            curFunc: def.entry,
            spOffset: 0
        };

        // Find out parameter offsets
        for (var i = 0; i < def.params.length; i++) {
            var param = def.params[i];
            var size = this.getTypeSize(param.type);
            param.location = context.spOffset;
            context.spOffset += size;
        }

        this.compileBlock(def.block, context);

        // Clear the reserved stack (practically only for subs because every function should end with a return statement)
        context.curFunc.nodes.push('SP = (SP - ' + context.spOffset + ')|0;');
        context.curFunc.nodes.push('CS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
    },

    compileBlock: function compileBlock(block, context, skipFunctionDefinitions) {
        // Reserve space for variables
        var varSize = 0;
        block.variables.forEach(function each(variable) {
            var size = this.getTypeSize(variable.type);

            variable.location = context.spOffset;
            context.spOffset += size;
            varSize += size;
        }.bind(this));
        if (varSize)
            context.curFunc.nodes.push('SP = (SP + ' + varSize + ')|0;');


        // Compile all the nodes
        block.nodes.forEach(function each(node) {
            switch (node.nodeType) {
                case 'FunctionCall':
                    this.callFunction(node, context);
                    // Skip the result
                    if (node.type) {
                        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(node.type) + ')|0;');
                        context.spOffset -= this.getTypeSize(node.type);
                    }
                    break;
                case 'Return':
                    // Compile the expression to the top of the stack
                    this.expr(node.expr, context);
                    // Move the result to the begining of the return stack
                    context.curFunc.nodes.push(this.getMemoryType(node.expr.type) + '[((SP - ' + context.spOffset + ')|0) >> ' + this.getTypeShift(node.expr.type) + '] = '
                        + this.getMemoryType(node.expr.type) + '[((SP - ' + this.getTypeSize(node.expr.type) + ')|0) >> ' + this.getTypeShift(node.expr.type) + '];');

                    // Return the stack to appropriate state
                    context.curFunc.nodes.push('SP = (SP - ' + (context.spOffset - this.getTypeSize(node.expr.type)) + ')|0;');
                    // ...pop the function from the call stack
                    context.curFunc.nodes.push('CS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
                    // And get out of here!
                    context.curFunc.nodes.push('return 1;');

                    break;
                case 'Comment':
                    break;
                case 'VariableDefinition':
                    if (node.initial) {
                        // Get the initial value to the top of the stack
                        this.expr(node.initial, context);
                        // Copy it from there to the variable location
                        context.curFunc.nodes.push(this.getMemoryType(node.initial.type) + '[((SP - ' + (context.spOffset - node.location) + ')|0) >> ' + this.getTypeShift(node.initial.type) + '] = '
                            + this.getMemoryType(node.initial.type) + '[((SP - ' + this.getTypeSize(node.initial.type) + ')|0) >> ' + this.getTypeShift(node.initial.type) + '];');
                        // Pop the original expression result from the stack
                        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(node.initial.type) + ')|0;');
                        context.spOffset -= this.getTypeSize(node.initial.type);
                        //throw new Error('Compiler doesn\'t support variable definitions with initial values');
                    }
                    break;
                case 'VariableAssignment':
                    // Get the value to the top of the stack
                    this.expr(node.expr, context);
                    // Copy it from there to the variable location
                    context.curFunc.nodes.push(this.getMemoryType(node.type) + '[((SP - ' + (context.spOffset - node.definition.location) + ')|0) >> ' + this.getTypeShift(node.type) + '] = '
                        + this.getMemoryType(node.expr.type) + '[((SP - ' + this.getTypeSize(node.expr.type) + ')|0) >> ' + this.getTypeShift(node.expr.type) + '];');
                    // Pop the original expression result from the stack
                    context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(node.expr.type) + ')|0;');
                    context.spOffset -= this.getTypeSize(node.expr.type);
                    break;
                case 'For':
                    this.forLoop(node, context);
                    break;
                case 'If':
                    this.ifStatement(node, context);
                    break;
                case 'RepeatForever':
                    this.repeatForever(node, context);
                    break;
                case 'RepeatUntil':
                    this.repeatUntil(node, context);
                    break;
                case 'RepeatWhile':
                    this.repeatWhile(node, context);
                    break;
                case 'FunctionDefinition':
                    if (skipFunctionDefinitions)
                        break;
                default:
                    console.log(node);
                    throw new Error('Unsupported node type "' + node.nodeType + '"');
            }
        }.bind(this));

        // Remove variables
        if (varSize)
            context.curFunc.nodes.push('SP = (SP - ' + varSize + ')|0;');
        context.spOffset -= varSize;
    },

    /*
     * Calls a function
     */
    callFunction: function callFunction(func, context) {
        var origSpOffset = context.spOffset;
        // Push parameters to the stack
        func.params.forEach(function each(param) {
            this.expr(param, context);
        }.bind(this));

        // Now call the function
        if (func.atomic) {
            // Move call stack pointer
            context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
            // Select function to be called
            context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + func.definition.entry.index + ';');
            // Call the function
            context.curFunc.nodes.push(this.fprefix + func.definition.entry.index + '()|0;');
            //throw new Error('Compiler doesn\'t support atomic calls (call to "' + func.name + '")');
        } else {
            // Set return function
            var retFunc = this.createFunction(context.name);

            // Set return function
            context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
            // Move call stack pointer
            context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
            // Select function to be called
            context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + func.definition.entry.index + ';');

            context.curFunc = retFunc;
        }

        // Return stack
        context.spOffset = origSpOffset;
        if (func.type)
            context.spOffset += this.getTypeSize(func.type);
    },

    /*
     * Compiles a for loop
     */
    forLoop: function forLoop(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set return function
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
        // Move call stack pointer
        context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
        // Select loop function
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // Add loop index to the stack with the start value
        loop.variable.location = context.spOffset;
        //context.spOffset += this.getTypeSize(loop.variable.type);
        this.expr(loop.range.start, context);

        // Compile the block
        context.curFunc = blockFunc;

        // Test for continuation in the begining
        this.expr(loop.range.end, context);
        // Do the testing
        context.curFunc.nodes.push('if ('
            + this.castTo(this.getMemoryType(loop.variable.type) + '[((SP - ' + (context.spOffset - loop.variable.location) + ')|0) >> ' + this.getTypeShift(loop.variable.type) + ']', loop.variable.type)
            + ' > '
            + this.castTo(this.getMemoryType(loop.variable.type) + '[((SP - ' + (this.getTypeSize(loop.variable.type)) + ')|0) >> ' + this.getTypeShift(loop.variable.type) + ']', loop.variable.type)
            + ') {'
            );
        {
            // Exit the loop: basically just pop the test value and call stack
            context.curFunc.nodes.push('\tSP = (SP - ' + this.getTypeSize(loop.variable.type) + ')|0;');
            context.curFunc.nodes.push('\tCS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
            context.curFunc.nodes.push('\treturn 1;');
        }
        context.curFunc.nodes.push('}');
        // Pop the test value
        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(loop.variable.type) + ')|0;');
        context.spOffset -= this.getTypeSize(loop.variable.type);

        // Then comes the block
        this.compileBlock(loop.block, context);

        // In the end increase the loop variable
        context.curFunc.nodes.push(
            this.getMemoryType(loop.variable.type) + '[((SP - ' + (context.spOffset - loop.variable.location) + ')|0) >> ' + this.getTypeShift(loop.variable.type) + '] = '
            + '(' + this.castTo(this.getMemoryType(loop.variable.type) + '[((SP - ' + (context.spOffset - loop.variable.location) + ')|0) >> ' + this.getTypeShift(loop.variable.type) + ']|0) + 1', 'INTEGER') + ';');

        // And go to the begining of the loop
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // After the loop:
        context.curFunc = retFunc;
        // Pop the loop variable off
        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(loop.variable.type) + ')|0;');
        context.spOffset -= this.getTypeSize(loop.variable.type);
    },

    /*
     * Compiles an if statement
     */
    ifStatement: function ifStatement(statement, context) {
        // Get the test value to the top of the stack
        this.expr(statement.expr, context);

        var retBlock = this.createFunction(context.name);
        var trueBlock = this.createFunction(context.name);
        var falseBlock;
        if (statement.falseStatement)
            falseBlock = this.createFunction(context.name);

        // Set the return function
        context.curFunc.nodes.push('\tMEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retBlock.index + ';');
        // Do the testing
        context.curFunc.nodes.push('if (' + this.castTo(this.getMemoryType(statement.expr.type) + '[((SP - ' + this.getTypeSize(statement.expr.type) + ')|0) >> ' + this.getTypeShift(statement.expr.type) + ']', statement.expr.type) + ') {');
        {
            // Jump to the true block
            context.curFunc.nodes.push('\tCS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
            context.curFunc.nodes.push('\tMEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + trueBlock.index + ';');
        }
        if (falseBlock) {
            context.curFunc.nodes.push('} else {');
            {
                // Jump to the false block if it exists
                context.curFunc.nodes.push('\tCS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
                context.curFunc.nodes.push('\tMEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + falseBlock.index + ';');
            }
        }
        context.curFunc.nodes.push('}');

        // Get rid of the test value
        context.curFunc.nodes.push('\tSP = (SP - ' + this.getTypeSize(statement.expr.type) + ')|0;');
        context.spOffset -= this.getTypeSize(statement.expr.type);

        // Compile the true block
        context.curFunc = trueBlock;
        this.compileBlock(statement.trueStatement, context);
        // Return from the true block
        context.curFunc.nodes.push('\tCS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');

        // Compile the false block
        if (falseBlock) {
            context.curFunc = falseBlock;
            if (statement.falseStatement.nodeType === 'If')
                this.ifStatement(statement.falseStatement, context);
            else
                this.compileBlock(statement.falseStatement, context);
            // Return from the true block
            context.curFunc.nodes.push('\tCS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
        }

        // And continue after the if statement
        context.curFunc = retBlock;
    },

    /*
     * Compiles a repeat-forever loop
     */
    repeatForever: function repeatForever(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return function
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
        // Jump to the block
        context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // Compile the block
        context.curFunc = blockFunc;
        this.compileBlock(loop.block, context);
        // In the end go back to the begining
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // TODO Breaking from the forever loop!

        // After the loop
        context.curFunc = retFunc;
    },
    /*
     * Compiles a repeat-until loop
     */
    repeatUntil: function repeatUntil(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return function
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
        // Jump to the block
        context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // Compile the block
        context.curFunc = blockFunc;
        this.compileBlock(loop.block, context);

        // In the end do the testing
        this.expr(loop.expr, context);
        context.curFunc.nodes.push('if (' + this.castTo(this.getMemoryType(loop.expr.type) + '[((SP - ' + this.getTypeSize(loop.expr.type) + ')|0) >> ' + this.getTypeShift(loop.expr.type) + ']', loop.expr.type) + ') {');
        {
            // Get rid of the test value
            context.curFunc.nodes.push('\tSP = (SP - ' + this.getTypeSize(loop.expr.type) + ')|0;');
            // Jump out of the loop
            context.curFunc.nodes.push('\tCS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
            context.curFunc.nodes.push('\treturn 1;');
        }
        context.curFunc.nodes.push('}');

        // Get rid of the test value
        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(loop.expr.type) + ')|0;');
        context.spOffset -= this.getTypeSize(loop.expr.type);

        // Not jumping out so go to the begining
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // TODO Breaking from the forever loop!

        // After the loop
        context.curFunc = retFunc;
    },
    /*
    * Compiles a repeat-while loop
    */
    repeatWhile: function repeatWhile(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return function
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
        // Jump to the block
        context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // Compile the block
        context.curFunc = blockFunc;
        this.compileBlock(loop.block, context);

        // In the end do the testing
        this.expr(loop.expr, context);
        context.curFunc.nodes.push('if (!(' + this.castTo(this.getMemoryType(loop.expr.type) + '[((SP - ' + this.getTypeSize(loop.expr.type) + ')|0) >> ' + this.getTypeShift(loop.expr.type) + ']', loop.expr.type) + ')) {');
        {
            // Get rid of the test value
            context.curFunc.nodes.push('\tSP = (SP - ' + this.getTypeSize(loop.expr.type) + ')|0;');
            // Jump out of the loop
            context.curFunc.nodes.push('\tCS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
            context.curFunc.nodes.push('\treturn 1;');
        }
        context.curFunc.nodes.push('}');

        // Get rid of the test value
        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(loop.expr.type) + ')|0;');
        context.spOffset -= this.getTypeSize(loop.expr.type);

        // Not jumping out so go to the begining
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + blockFunc.index + ';');

        // TODO Breaking from the forever loop!

        // After the loop
        context.curFunc = retFunc;
    },

    expr: function expr(expr, context) {
        switch (expr.nodeType) {
            case 'Number':
                //context.curFunc.nodes.push('//Number');
                //context.curFunc.nodes.push(this.getMemoryType(expr.type) + '[SP >> ' + this.getTypeShift(expr.type) + '] = ' + expr.val + ';');
                //context.curFunc.nodes.push('SP = (SP + ' + this.getTypeSize(expr.type) + ')|0;');
                //context.spOffset += this.getTypeSize(expr.type);
                context.curFunc.nodes.push(this.pushToStack(expr.type, expr.val, context));
                //context.curFunc.nodes.push('//!Number');
                return;
            case 'Variable':
                //context.curFunc.nodes.push('//Variable');
                //context.curFunc.nodes.push(this.getMemoryType(expr.type) + '[SP >> ' + this.getTypeShift(expr.type) + '] = '
                //    + this.getMemoryType(expr.type) + '[((SP - ' + (context.spOffset - expr.definition.location) + ')|0) >> ' + this.getTypeShift(expr.type) + '];');
                //context.curFunc.nodes.push('SP = (SP + ' + this.getTypeSize(expr.type) + ')|0;');
                //context.spOffset += this.getTypeSize(expr.type);

                context.curFunc.nodes.push(this.pushToStack(expr.type, this.readFromMemory(expr.definition, context), context));

                //context.curFunc.nodes.push('//!Variable');
                return;
            case 'BinaryOp':
                //context.curFunc.nodes.push('//Binop');
                // Get the left and right side of the operator to the top of the stack
                this.expr(expr.left, context);
                this.expr(expr.right, context);

                var dest = this.getMemoryType(expr.type) + '[((SP - ' + (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.type) + ']';
                var left = this.castTo(this.getMemoryType(expr.left.type) + '[((SP - ' + (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.left.type) + ']', expr.left.type);
                var right = this.castTo(this.getMemoryType(expr.right.type) + '[((SP - ' + (this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.right.type) + ']', expr.right.type);
                var map = {
                    plus: '+',
                    minus: '-',
                    mul: '*',
                    div: '/',
                    lt: '<',
                    gt: '>',
                    eq: '=='
                };
                var op = map[expr.op];
                var src;
                if (!op)
                    throw new Error('Compiler doesn\'t suuport "' + expr.op + '" operator');
                if (op === '*' && expr.type === 'INTEGER') {
                    // Integer multiplication is a special case
                    src = 'imul(' + left + ', ' + right + ')';
                } else {
                    src = left + ' ' + op + ' ' + right;
                }

                context.curFunc.nodes.push(dest + ' = ' + this.castTo(src, expr.type) + ';');
                //context.curFunc.nodes.push(
                //    this.getMemoryType(expr.type) + '[((SP - ' + (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.type) + '] = '
                //    + this.castTo(
                //        this.castTo(this.getMemoryType(expr.left.type) + '[((SP - ' + (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.left.type) + ']', expr.left.type)
                //        + op
                //        + this.castTo(this.getMemoryType(expr.right.type) + '[((SP - ' + (this.getTypeSize(expr.right.type)) + ')|0) >> ' + this.getTypeShift(expr.right.type) + ']', expr.right.type),
                //        expr.type
                //    )
                //    + ';'
                //    );
                context.curFunc.nodes.push('SP = (SP - ' + (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + ' + ' + this.getTypeSize(expr.type) + ')|0;');
                context.spOffset = context.spOffset - (this.getTypeSize(expr.left.type) + this.getTypeSize(expr.right.type)) + this.getTypeSize(expr.type);
                //context.curFunc.nodes.push('//!Binop');
                return;
            case 'FunctionCall':
                this.callFunction(expr, context);
                return;
            case 'Range':

        }
        throw new Error('Unsupported expression to be compiled "' + expr.nodeType + '"');
    },

    getTypeSize: function getTypeSize(type) {
        return 1 << this.getTypeShift(type);
    },
    getTypeShift: function getTypeShift(type) {
        switch (type) {
            case 'INTEGER':
                return 2;
            case 'DOUBLE':
                return 2;           // Really just a regular float: TODO: Change to real doubles!!!
        }
        throw new Error('Unsupported type "' + type + '"');
    },
    getMemoryType: function getMemoryType(type) {
        switch (type) {
            case 'INTEGER':
                return 'MEMS32';
            case 'DOUBLE':
                return 'MEMF32';
        }
        throw new Error('Unsupported type "' + type + '"');
    },
    castTo: function castTo(expr, type) {
        switch (type) {
            case 'INTEGER':
                return '((' + expr + ')|0)';
            case 'DOUBLE':
                return '+(' + expr + ')';
        }
        throw new Error('Unsupported type to cast into "' + type + '"');
    },

    writeToMemory: function writeToMemory(variable, value, context) {
        return this.getMemoryType(variable.type) + '[((SP - ' + (context.spOffset - variable.definition.location) + ')|0) >> ' + this.getTypeShift(variable.type) + '] = ' + this.castTo(value, variable.type) + ';';
    },
    readFromMemory: function readFromMemory(definition, context) {
        return this.castTo(this.getMemoryType(definition.type) + '[((SP - ' + (context.spOffset - definition.location) + ')|0) >> ' + this.getTypeShift(definition.type) + ']', definition.type);
    },
    pushToStack: function pushToStack(type, value, context) {
        context.spOffset += this.getTypeSize(type);
        return this.getMemoryType(type) + '[SP >> ' + this.getTypeShift(type) + '] = ' + this.castTo(value, type) + ';'
        + 'SP = (SP + ' + this.getTypeSize(type) + ')|0;';
    },

    createFunction: function createFunction(originalName) {
        var name = this.fprefix + this.nextFreeFunction;
        var ret = {
            name: name,
            origName: originalName,
            index: this.nextFreeFunction,
            nodes: [],
            //stackDepth: 0
        };
        this.nextFreeFunction++;

        this.createdFunctions.push(ret);

        return ret;
    },
    createFunctionsCode: function createFunctionsCode() {
        var buf = [];
        this.createdFunctions.forEach(function each(func, i) {
            if (func.origName)
                buf.push('// ' + func.origName);
            buf.push('function ' + func.name + '() {');
            buf.push('\t__log(' + i + ');');
            buf.push('\t' + func.nodes.join('\n\t'));
            buf.push('\treturn ' + (func.nativeBreaking ? '0' : '1') + ';');
            buf.push('}');
        });
        return buf.join('\n');
    },
    createFTable: function createFTable() {
        var fnames = this.createdFunctions.map(function map(val) {
            return val.name;
        });

        while (fnames.length !== (fnames.length & -fnames.length))
            fnames.push(this.fprefix + '0');                        // TODO: Fill with errors, not working functions

        return 'var ' + this.ftableName + ' = [' + fnames.join(', ') + '];';
    },
    getFTableMask: function getFTableMask() {
        var mask = this.createdFunctions.length;
        // TODO Faster mask finder
        while (mask !== (mask & -mask))
            mask++;
        return mask - 1;
    },
    compileSystemFunctionDefinitions: function compileSystemFunctionDefinitions() {
        var buf = [];
        this.functions.forEach(function each(val) {
            if (val.jsname) {
                buf.push('var ' + val.jsname + ' = env.' + val.jsname + ';');
            }
        });
        return buf.join('\n');
    }
}

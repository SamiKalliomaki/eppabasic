/// <reference path="types.js" />
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
                paramSize += param.size;
            }.bind(this));

            entry.nodes.push(jsname + '(SP|0);');

            var retSize = 0;
            if (returnType)
                retSize = returnType.size;
            entry.nodes.push('SP = (SP - ' + (paramSize - retSize) + ')|0;');
            entry.nodes.push('CS = (CS - ' + Types.Integer.size + ')|0;');
        }
        if (!atomic)
            entry.nativeBreaking = true;
        var ret = {
            name: name,
            paramTypes: paramTypes,
            jsname: jsname,
            returnType: returnType,
            atomic: atomic,
            entry: entry
        };
        this.functions.push(ret);
        return ret;
    },

    /*
     * A helper function for loading runtime modules
     */
    loadModule: function loadModule(name) {
        var module = window['compiler' + name];
        module = module.toString();
        var start = module.indexOf('{');
        var end = module.lastIndexOf('}');
        module = module.substr(start + 1, end - start - 1);
        return module;
    },

    /*
     * Compiles ast tree into asm.js
     */
    compile: function compile() {
        // Find user defined functions
        this.ast.nodes.forEach(function each(def) {
            if (def.nodeType === 'FunctionDefinition') {
                var paramTypes = def.params.map(function map(def) {
                    return def.type;
                })
                def.handle = this.defineJsFunction(def.name, paramTypes, undefined, def.type, undefined, this.createFunction(def.name));
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
        var context = new CompilerContext('MAIN', entry);
        this.compileBlock(this.ast, context, true);
        // Finally call stop function forever
        var stopFunction = this.createFunction('END');
        stopFunction.nativeBreaking = true;
        context.setCallStack(stopFunction);

        return ('function Program(stdlib, env, heap) {\n'
                + '"use asm";\n'
                // Memories
                + 'var MEMS32 = new stdlib.Int32Array(heap);\n'
                + 'var MEMU32 = new stdlib.Uint32Array(heap);\n'
                + 'var MEMF32 = new stdlib.Float32Array(heap);\n'
                + 'var MEMF64 = new stdlib.Float64Array(heap);\n'
                // Pointers
                + 'var SP = 0;\n'                                                   // Stack pointer
                + 'var CS = 0;\n'                                                   // Call stack pointer

                // Standard math functions
                + 'var imul = stdlib.Math.imul;'

                // Imported functions
                + this.compileSystemFunctionDefinitions() + '\n'

                // Modules
                + this.loadModule('Memory')
                + this.loadModule('Math')

                // Calling next operator
                + 'function next() {\n'
                + '\twhile(' + this.ftableName + '[MEMU32[CS >> ' + Types.Integer.shift + '] & ' + this.getFTableMask() + ']()|0);\n'
                + '}\n'

                // Initialize program
                + 'function init() {\n'
                + '\tmeminit();\n'
                + '\tSP = memreserve4(4096)|0;\n'
                + '\tCS = memreserve4(256)|0;\n'
                + '\tMEMU32[CS >> ' + Types.Integer.shift + '] = ' + entry.index + ';\n'
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
        var context = new CompilerContext(def.name, def.handle.entry);
        context.pushOffset();       // Save current stack state

        // Find out parameter offsets
        for (var i = 0; i < def.params.length; i++) {
            var param = def.params[i];
            var size = param.type.size;
            param.location = context.pushStack(param.type);
        }

        this.compileBlock(def.block, context);

        context.popOffset();        // Revert stack
        context.popCallStack();     // And return from the function
    },

    /*
     * Compiles a block
     */
    compileBlock: function compileBlock(block, context, skipFunctionDefinitions) {
        // Reserve space for variables
        context.pushOffset();
        var varSize = 0;
        block.variables.forEach(function each(variable) {
            var size = variable.type.size;
            variable.location = context.pushStack(variable.type);
        }.bind(this));


        // Compile all the nodes
        block.nodes.forEach(function each(node) {
            switch (node.nodeType) {
                case 'FunctionCall':
                    this.callFunction(node, context);
                    // Skip the return value
                    if (node.type)
                        context.popStack(node.type);
                    break;
                case 'Return':
                    // Compile the expression to the top of the stack
                    this.expr(node.expr, context);
                    // Move the result to the begining of the return stack
                    context.push(node.expr.type.memoryType + '[((SP - ' + context.spOffset + ')|0) >> ' + node.expr.type.shift + '] = '
                        + node.expr.type.memoryType + '[((SP - ' + node.expr.type.size + ')|0) >> ' + node.expr.type.shift + '];');

                    // Return the stack to appropriate state
                    context.push('SP = (SP - ' + (context.spOffset - node.expr.type.size) + ')|0;');
                    // ...pop the function from the call stack
                    context.popCallStack();
                    // And get out of here!
                    context.push('return 1;');
                    break;
                case 'Comment':
                    break;
                case 'VariableDefinition':
                    if (node.dimensions) {
                        if (node.initial)
                            throw new Error('Initial values not supported for arrays');
                        var dims = this.expr(node.dimensions, context);
                        context.push(node.location.setValue('memreserve' + node.type.size + '((' + dims.getValue() + '*' + node.type.size + ')|0)'));
                        //context.push(node.dimensions.type.memoryType + '[((SP - ' + (context.spOffset - node.location) + ')|0) >> ' + node.dimensions.type.shift + '] = '
                        //    + 'memreserve' + node.dimensions.type.size + '(' + node.dimensions.type.cast(node.dimensions.type.cast(node.dimensions.type.memoryType + '[((SP - ' + node.dimensions.type.size + ')|0) >> ' + node.dimensions.type.shift + ']') + '*' + node.type.size) + ')|0');
                        context.popStack(node.dimensions.type);
                    }
                    if (node.initial) {
                        // Get the initial value to the top of the stack
                        var val = this.expr(node.initial, context);
                        // Copy it from there to the variable location
                        context.push(node.location.setValue(val.getValue()));
                        //context.push(node.type.memoryType + '[((SP - ' + (context.spOffset - node.location) + ')|0) >> ' + node.type.shift + '] = '
                        //    + node.initial.type.memoryType + '[((SP - ' + node.initial.type.size + ')|0) >> ' + node.initial.type.shift + '];');
                        // Pop the original expression result from the stack
                        context.popStack(node.initial.type);
                    }
                    break;
                case 'VariableAssignment':
                    // Get the value to the top of the stack
                    var val = this.expr(node.expr, context);
                    // Copy it from there to the variable location
                    if (node.dimensions) {
                        // An array
                        var dims = this.expr(node.dimensions, context);

                        var baseAddress = node.definition.location.getValue();//'(' + expr.dimensions.type.memoryType + '[((SP - ' + (context.spOffset - expr.definition.location) + ')|0) >> ' + expr.dimensions.type.shift + ']|0)';
                        var offsetAddress = '((' + dims.getValue() + '*' + node.type.size + ')|0)';

                        context.push(new CompilerAbsoluteReference(node.type, baseAddress + ' + ' + offsetAddress, context).setValue(val.getValue()));

                        context.popStack(node.dimensions.type);
                    } else {
                        // Not an array
                        context.push(node.definition.location.setValue(val.getValue()));
                    }
                    // Pop the original expression result from the stack
                    context.popStack(node.expr.type);
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
        context.popOffset();
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
            // Select function to be called
            context.pushCallStack(func.handle.entry);
            // Call the function
            context.push(this.fprefix + func.handle.entry.index + '()|0;');
        } else {
            // Set return function
            var retFunc = this.createFunction(context.name);

            // Set return function
            context.setCallStack(retFunc);
            // Select function to be called
            context.pushCallStack(func.handle.entry);

            context.setFunction(retFunc);
        }

        // Return stack
        context.spOffset = origSpOffset;
        if (func.type) {
            context.spOffset += func.type.size;
            return new CompilerStackReference(func.type, context.spOffset - func.type.size, context);
        }
    },

    /*
     * Compiles a for loop
     */
    forLoop: function forLoop(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set return and loop functions
        context.setCallStack(retFunc);
        context.pushCallStack(blockFunc);

        // Add loop index to the stack with the start value
        loop.variable.location = this.expr(loop.range.start, context);
        //context.spOffset += loop.variable.type.size;


        // Compile the block
        context.setFunction(blockFunc);

        // Test for continuation in the begining
        this.expr(loop.range.end, context);
        // Do the testing
        context.push('if ('
            + loop.variable.location.getValue()
            + ' > '
            + loop.variable.type.cast(loop.variable.type.memoryType + '[((SP - ' + (loop.variable.type.size) + ')|0) >> ' + loop.variable.type.shift + ']')
            + ') {'
            );
        {
            // Exit the loop: basically just pop the test value and call stack
            context.push('\tSP = (SP - ' + loop.variable.type.size + ')|0;');
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');
        // Pop the test value
        context.push('SP = (SP - ' + loop.variable.type.size + ')|0;');
        context.spOffset -= loop.variable.type.size;

        // Then comes the block
        this.compileBlock(loop.block, context);

        // In the end increase the loop variable
        context.push(loop.variable.location.setValue(Types.Integer.cast(loop.variable.location.getValue() + ' + 1')));
        //context.push(
        //    loop.variable.type.memoryType + '[((SP - ' + (context.spOffset - loop.variable.location) + ')|0) >> ' + loop.variable.type.shift + '] = '
        //    + '(' + Types.Integer.cast(loop.variable.type.memoryType + '[((SP - ' + (context.spOffset - loop.variable.location) + ')|0) >> ' + loop.variable.type.shift + ']|0) + 1') + ';');

        // And go to the begining of the loop
        context.setCallStack(blockFunc);

        // After the loop:
        context.setFunction(retFunc);
        // Pop the loop variable off
        context.popStack(loop.variable.type);
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
        context.setCallStack(retBlock);
        // Do the testing
        context.push('if (' + statement.expr.type.cast(statement.expr.type.memoryType + '[((SP - ' + statement.expr.type.size + ')|0) >> ' + statement.expr.type.shift + ']') + ') {');
        {
            // Jump to the true block
            context.pushCallStack(trueBlock);
        }
        if (falseBlock) {
            context.push('} else {');
            {
                // Jump to the false block if it exists
                context.pushCallStack(falseBlock);
            }
        }
        context.push('}');

        // Get rid of the test value
        context.popStack(statement.expr.type);

        // Compile the true block
        context.setFunction(trueBlock);
        this.compileBlock(statement.trueStatement, context);
        // Return from the true block
        context.popCallStack();

        // Compile the false block
        if (falseBlock) {
            context.setFunction(falseBlock);
            if (statement.falseStatement.nodeType === 'If')
                this.ifStatement(statement.falseStatement, context);
            else
                this.compileBlock(statement.falseStatement, context);
            // Return from the true block
            context.popCallStack();
        }

        // And continue after the if statement
        context.setFunction(retBlock);
    },

    /*
     * Compiles a repeat-forever loop
     */
    repeatForever: function repeatForever(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return and block functions
        context.setCallStack(retFunc);
        context.pushCallStack(blockFunc);

        // Compile the block
        context.setFunction(blockFunc);
        this.compileBlock(loop.block, context);
        // In the end go back to the begining
        context.setCallStack(blockFunc);

        // TODO Breaking from the forever loop!

        // After the loop
        context.setFunction(retFunc);
    },
    /*
     * Compiles a repeat-until loop
     */
    repeatUntil: function repeatUntil(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return and block functions
        context.setCallStack(retFunc);
        context.pushCallStack(blockFunc);

        // Compile the block
        context.setFunction(blockFunc);
        this.compileBlock(loop.block, context);

        // In the end do the testing
        this.expr(loop.expr, context);
        context.push('if (' + loop.expr.type.cast(loop.expr.type.memoryType + '[((SP - ' + loop.expr.type.size + ')|0) >> ' + loop.expr.type.shift + ']') + ') {');
        {
            // Get rid of the test value
            context.popStack(loop.expr.type, false);
            // Jump out of the loop
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');

        // Get rid of the test value
        context.popStack(loop.expr.type);

        // Not jumping out so go to the begining
        context.setCallStack(blockFunc);

        // TODO Breaking from the until loop!

        // After the loop
        context.setFunction(retFunc);
    },
    /*
    * Compiles a repeat-while loop
    */
    repeatWhile: function repeatWhile(loop, context) {
        var blockFunc = this.createFunction(context.name);
        var retFunc = this.createFunction(context.name);

        // Set the return and block functions
        context.setCallStack(retFunc);
        context.pushCallStack(blockFunc);

        // Compile the block
        context.setFunction(blockFunc);
        this.compileBlock(loop.block, context);

        // In the end do the testing
        this.expr(loop.expr, context);
        context.push('if (!(' + loop.expr.type.cast(loop.expr.type.memoryType + '[((SP - ' + loop.expr.type.size + ')|0) >> ' + loop.expr.type.shift + ']') + ')) {');
        {
            // Get rid of the test value
            context.popStack(loop.expr.type, false);
            // Jump out of the loop
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');

        // Get rid of the test value
        context.popStack(loop.expr.type);

        // Not jumping out so go to the begining
        context.setCallStack(blockFunc);

        // TODO Breaking from the while loop!

        // After the loop
        context.setFunction(retFunc);
    },

    expr: function expr(expr, context) {
        switch (expr.nodeType) {
            case 'Number':
                return context.pushStack(expr.type, expr.val);
            case 'Variable':
                if (expr.dimensions) {
                    var val = context.pushStack(expr.type);

                    var dims = this.expr(expr.dimensions, context);

                    var baseAddress = expr.definition.location.getValue();//'(' + expr.dimensions.type.memoryType + '[((SP - ' + (context.spOffset - expr.definition.location) + ')|0) >> ' + expr.dimensions.type.shift + ']|0)';
                    var offsetAddress = '((' + dims.getValue() + '*' + expr.type.size + ')|0)';

                    context.push(val.setValue(new CompilerAbsoluteReference(expr.type, baseAddress + ' + ' + offsetAddress, context).getValue()));

                    //context.push(expr.type.memoryType + '[((SP - ' + (expr.dimensions.type.size + expr.type.size) + ')|0) >> ' + expr.type.shift + '] = '
                    //            + expr.type.memoryType + '[((' + baseAddress + ' + ' + offsetAddress + ')|0) >> ' + expr.type.shift + ']');

                    //context.push(expr.type.memoryType + '[((' + baseAddress + ' + ' + offsetAddress + ')|0) >> ' + expr.type.shift + ']' + ' = '
                    //    + expr.expr.type.memoryType + '[((SP - ' + (expr.expr.type.size + expr.dimensions.type.size) + ')|0) >> ' + expr.expr.type.shift + '];');

                    // Pop the dimensions
                    context.popStack(expr.dimensions.type);

                    return val;

                    //throw new Error('Arrays not supported in expressions, yet.');
                } else {
                    console.log(expr);
                    return context.pushStack(expr.type, expr.definition.location.getValue());
                }
            case 'BinaryOp':
                // Get the left and right side of the operator to the top of the stack
                this.expr(expr.left, context);
                this.expr(expr.right, context);

                var dest = expr.type.memoryType + '[((SP - ' + (expr.left.type.size + expr.right.type.size) + ')|0) >> ' + expr.type.shift + ']';
                var left = expr.type.cast(expr.left.type.cast(expr.left.type.memoryType + '[((SP - ' + (expr.left.type.size + expr.right.type.size) + ')|0) >> ' + expr.left.type.shift + ']'));
                var right = expr.type.cast(expr.right.type.cast(expr.right.type.memoryType + '[((SP - ' + (expr.right.type.size) + ')|0) >> ' + expr.right.type.shift + ']'));
                var map = {
                    plus: '+',
                    minus: '-',
                    mul: '*',
                    div: '/',
                    mod: '%',

                    lt: '<',
                    lte: '<=',
                    gt: '>',
                    gte: '>=',
                    eq: '==',
                    neq: '!='
                };
                var op = map[expr.op];
                var src;
                if (!op)
                    throw new Error('Compiler doesn\'t suuport "' + expr.op + '" operator');
                if (op === '*' && expr.type === Types.Integer) {
                    // Integer multiplication is a special case
                    src = 'imul(' + left + ', ' + right + ')';
                } else {
                    src = left + ' ' + op + ' ' + right;
                }

                context.push(dest + ' = ' + expr.type.cast(src) + ';');

                context.push('SP = (SP - ' + (expr.left.type.size + expr.right.type.size) + ' + ' + expr.type.size + ')|0;');
                context.spOffset = context.spOffset - (expr.left.type.size + expr.right.type.size) + expr.type.size;
                return new CompilerStackReference(expr.type, context.spOffset - expr.type.size, context);
            case 'FunctionCall':
                return this.callFunction(expr, context);
            case 'Range':

        }
        throw new Error('Unsupported expression to be compiled "' + expr.nodeType + '"');
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
            //buf.push('\t__log(' + i + ');');
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

function CompilerContext(name, entry) {
    this.name = name;
    this.func = entry;
    this.spOffset = 0;
    this.offsets = [];
}

CompilerContext.prototype = {
    setCallStack: function setCallStack(func) {
        this.push('MEMU32[CS >> ' + Types.Integer.shift + '] = ' + func.index + ';');
    },
    pushCallStack: function pushCallStack(func) {
        // Increase call stack pointer...
        this.push('CS = (CS + ' + Types.Integer.size + ')|0;');
        // ...and set the function
        this.setCallStack(func);
    },
    popCallStack: function popCallStack() {
        this.push('CS = (CS - ' + Types.Integer.size + ')|0;');
    },
    pushStack: function pushStack(type, value) {
        this.spOffset += type.size;
        var code = '';
        if (value)
            code = type.memoryType + '[SP >> ' + type.shift + '] = ' + type.cast(value) + ';';
        code += 'SP = (SP + ' + type.size + ')|0;';
        this.push(code);
        return new CompilerStackReference(type, this.spOffset - type.size, this);
    },
    popStack: function popStack(type, editOffset) {
        if (editOffset !== false)
            editOffset = true;
        if (editOffset)
            this.spOffset -= type.size;
        this.push('SP = (SP - ' + type.size + ')|0;');
    },
    pushOffset: function pushOffset() {
        this.offsets.push(this.spOffset);
    },
    popOffset: function popOffset() {
        var oldOffset = this.offsets.pop();
        this.push('SP = (SP - ' + (this.spOffset - oldOffset) + ')|0;');
        this.spOffset = oldOffset;
    },
    getVariableValue: function getVariableValue(variable, type) {
        var offset;
        if (typeof variable === 'Number') {
            offset = variable;
        } else {
            offset = this.spOffset - variable.location
            if (!type)
                type = variable.type;
        }
        if (!type)
            throw new Error('Type not defined');

        return type.cast(type.memoryType + '[((SP - ' + offset + ')|0) >> ' + type.shift + ']');
    },
    setVariableValue: function setVariableValue(variable, value, type) {
        var offset;
        if (typeof variable === 'Number') {
            offset = variable;
        } else {
            offset = this.spOffset - variable.location
            if (!type)
                type = variable.type;
        }
        if (!type)
            throw new Error('Type not defined');

        return type.memoryType + '[((SP - ' + offset + ')|0) >> ' + type.shift + '] = ' + type.cast(value) + ';';
    },


    push: function push(str) {
        this.func.nodes.push(str);
    },
    setFunction: function setFunction(func) {
        this.func = func;
    }
};

function CompilerStackReference(type, offset, context) {
    this.type = type;
    this.offset = offset;
    this.context = context;
}

CompilerStackReference.prototype = {
    getValue: function getValue() {
        return this.type.cast(this.type.memoryType + '[((SP - ' + (this.context.spOffset - this.offset) + ')|0) >> ' + this.type.shift + ']');
    },
    setValue: function setValue(value) {
        return this.type.memoryType + '[((SP - ' + (this.context.spOffset - this.offset) + ')|0) >> ' + this.type.shift + '] = ' + this.type.cast(value) + ';';
    }
};

function CompilerAbsoluteReference(type, offset, context) {
    this.type = type;
    this.offset = offset;
    this.context = context;
}

CompilerAbsoluteReference.prototype = {
    getValue: function getValue() {
        return this.type.cast(this.type.memoryType + '[((' + this.offset + ')|0) >> ' + this.type.shift + ']');
    },
    setValue: function setValue(value) {
        return this.type.memoryType + '[((' + this.offset + ')|0) >> ' + this.type.shift + '] = ' + this.type.cast(value) + ';';
    }
};
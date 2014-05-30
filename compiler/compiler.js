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

            // Compute parameter size
            var paramSize = 0;
            paramTypes.forEach(function each(param) {
                paramSize += param.size;
            }.bind(this));

            // Call the native function
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
        var context = new CompilerContext(def.name, def.handle.entry, def.type);
        context.pushOffset();       // Save current stack state

        // Find out parameter offsets
        for (var i = 0; i < def.params.length; i++) {
            var param = def.params[i];
            var size = param.type.size;
            param.location = new CompilerStackReference(param.type, context.spOffset, context);
            context.spOffset += size;
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
                    var val = this.callFunction(node, context);
                    // Skip the return value
                    if (val)
                        val.pop();
                    break;
                case 'Return':
                    // Compile the expression to the top of the stack
                    var val = this.expr(node.expr, context);
                    if (val.type !== context.returnType)
                        throw new Error('Return statement type doesn\'t match function type');

                    // Move the result to the begining of the return stack
                    context.push(new CompilerStackReference(context.returnType, 0, context).setValue(val.getValue()));

                    // Return the stack to appropriate state
                    context.popStack(context.spOffset - val.type.size, false);
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
                        context.popStack(node.dimensions.type);
                    }
                    if (node.initial) {
                        // Get the initial value to the top of the stack
                        var val = this.expr(node.initial, context);
                        // Copy it from there to the variable location
                        context.push(node.location.setValue(val.getValue()));
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

                        var baseAddress = node.definition.location.getValue();
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

        // Compute start, stop and step values to stack
        loop.variable.location = this.expr(loop.start, context);
        var stop = this.expr(loop.stop, context);
        var step = this.expr(loop.step, context);

        // Set block to be compiled
        context.setFunction(blockFunc);

        // Test for continuation in the begining of every loop
        context.push('if ('
            + loop.variable.location.getValue()
            + ' > '
            + stop.getValue()
            + ') {'
            );
        {
            // Exit the loop
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');

        // Compile block
        this.compileBlock(loop.block, context);

        // In the end increase the loop variable
        context.push(loop.variable.location.setValue(loop.variable.location.getValue() + ' + ' + step.getValue()));

        // And go to the begining of the loop
        context.setCallStack(blockFunc);

        // After the loop:
        context.setFunction(retFunc);
        // Pop the loop variables off
        step.pop();
        stop.pop();
        loop.variable.location.pop();
    },

    /*
     * Compiles an if statement
     */
    ifStatement: function ifStatement(statement, context) {
        var retBlock = this.createFunction(context.name);
        var trueBlock = this.createFunction(context.name);
        var falseBlock;
        if (statement.falseStatement)
            falseBlock = this.createFunction(context.name);

        // Set the return function
        context.setCallStack(retBlock);
        // Do the testing
        var test = this.expr(statement.expr, context);
        context.push('if (' + test.getValue() + ') {');
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
        test.pop();

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
        var test = this.expr(loop.expr, context);
        context.push('if (' + test.getValue() + ') {');
        {
            // Get rid of the test value
            context.popStack(loop.expr.type, false);
            // Jump out of the loop
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');

        // Get rid of the test value
        test.pop();

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
        var test = this.expr(loop.expr, context);
        context.push('if (!(' + test.getValue() + ')) {');
        {
            // Get rid of the test value
            context.popStack(loop.expr.type, false);
            // Jump out of the loop
            context.popCallStack();
            context.push('\treturn 1;');
        }
        context.push('}');

        // Get rid of the test value
        test.pop();

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

                    var baseAddress = expr.definition.location.getValue();
                    var offsetAddress = '((' + dims.getValue() + '*' + expr.type.size + ')|0)';

                    context.push(val.setValue(new CompilerAbsoluteReference(expr.type, baseAddress + ' + ' + offsetAddress, context).getValue()));

                    // Pop the dimensions
                    context.popStack(expr.dimensions.type);

                    return val;
                } else {
                    return context.pushStack(expr.type, expr.definition.location.getValue());
                }
            case 'BinaryOp':
                // Get the left and right side of the operator to the top of the stack
                var dest = context.pushStack(expr.type);
                var leftVal = this.expr(expr.left, context);
                var rightVal = this.expr(expr.right, context);

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
                    src = 'imul(' + leftVal.getValue() + ', ' + rightVal.getValue() + ')';
                } else {
                    src = leftVal.getValue() + ' ' + op + ' ' + rightVal.getValue();
                }

                context.push(dest.setValue(src));

                rightVal.pop();
                leftVal.pop();
                return dest;
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

function CompilerContext(name, entry, type) {
    this.name = name;
    this.func = entry;
    this.spOffset = 0;
    this.offsets = [];
    this.returnType = type;
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
        var size;
        if (typeof type === 'number')
            size = type;
        else
            size = type.size;
        if (editOffset !== false)
            editOffset = true;
        if (editOffset)
            this.spOffset -= size;
        this.push('SP = (SP - ' + size + ')|0;');
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
    this.exists = true;
}

CompilerStackReference.prototype = {
    getValue: function getValue() {
        return this.type.cast(this.type.memoryType + '[((SP - ' + (this.context.spOffset - this.offset) + ')|0) >> ' + this.type.shift + ']');
    },
    setValue: function setValue(value) {
        return this.type.memoryType + '[((SP - ' + (this.context.spOffset - this.offset) + ')|0) >> ' + this.type.shift + '] = ' + this.type.cast(value) + ';';
    },
    pop: function pop(editOffset) {
        if (editOffset !== false)
            editOffset = true;
        if (this.offset + this.type.size !== this.context.spOffset && editOffset)
            throw new Error('Compiler popping stack in wrong order!')
        if (!this.exists)
            throw new Error('Value already popped from the stack');
        this.context.popStack(this.type.size, editOffset);
        if (editOffset)
            this.exists = false;
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
    },
    pop: function pop() { }
};
/// <reference path="types.js" />
/// <reference path="typechecker.js" />
/// <reference path="atomicchecker.js" />

function Compiler(ast, operators) {
    /// <param name='operators' type='OperatorContainer' />

    this.ast = ast;
    this.operators = operators;
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
        var checker = new Typechecker(this.ast, this.functions, this.operators);
        checker.check();
        checker = new Atomicchecker(this.ast, this.functions);
        checker.check();

        // Find locations for global functions
        var globalVarariableOffset = 0;
        this.ast.variables.forEach(function each(variable) {
            var size = variable.type.size;
            variable.location = new CompilerAbsoluteReference(variable.type, globalVarariableOffset, null);
            globalVarariableOffset += size;
        }.bind(this));

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
                + 'var MEMU8 = new stdlib.Uint8Array(heap);\n'
                + 'var MEMS32 = new stdlib.Int32Array(heap);\n'
                + 'var MEMU32 = new stdlib.Uint32Array(heap);\n'
                + 'var MEMF32 = new stdlib.Float32Array(heap);\n'
                + 'var MEMF64 = new stdlib.Float64Array(heap);\n'
                // Pointers
                + 'var SP = 0;\n'                                                   // Stack pointer
                + 'var CS = 0;\n'                                                   // Call stack pointer

                // Standard math functions
                + 'var imul = stdlib.Math.imul;\n'
                + 'var pow = stdlib.Math.pow;\n'

                // Imported functions
                + this.compileSystemFunctionDefinitions() + '\n'

                // Modules
                + this.loadModule('Memory')
                + this.loadModule('Math')
                + this.loadModule('String')

                // Calling next operator
                + 'function next() {\n'
                + '\twhile(' + this.ftableName + '[MEMU32[CS >> ' + Types.Integer.shift + '] & ' + this.getFTableMask() + ']()|0);\n'
                + '}\n'

                // Initialize program
                + 'function init() {\n'
                + '\tmeminit(' + globalVarariableOffset + ');\n'
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
                + '\tcs: cs,\n'
                + '\tmemreserve4: memreserve4,\n'
                + '\tmemreserve8: memreserve8,\n'
                + '\tmemfree: memfree\n'
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
    compileBlock: function compileBlock(block, context, global) {
        // Reserve space for variables
        context.pushOffset();
        var varSize = 0;
        if (!global) {
            block.variables.forEach(function each(variable) {
                var size = variable.type.size;
                variable.location = context.pushStack(variable.type);
            }.bind(this));
        }


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
                        context.push(node.location.setValue('(memreserve' + node.type.size + '((' + dims.getValue() + '*' + node.type.size + ')|0)|0)'));
                        context.popStack(node.dimensions.type);
                    }
                    if (node.initial) {
                        // Get the initial value to the top of the stack
                        var val = this.expr(node.initial, context);
                        // Copy it from there to the variable location
                        context.push(node.location.setValue(val.getValue()));
                        // Pop the original expression result from the stack
                        val.pop();
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
                    if (global)
                        break;
                default:
                    console.log(node);
                    throw new Error('Unsupported node type "' + node.nodeType + '"');
            }

            // Free all reserved memory
            context.freeQueuedObjects();
        }.bind(this));

        // Remove variables
        context.popOffset();
    },

    /*
     * Calls a function
     */
    callFunction: function callFunction(func, context) {
        var origSpOffset = context.spOffset;

        //var params = [];
        // Push parameters to the stack
        func.params.forEach(function each(param) {
            var ref = this.expr(param, context);
            //if (ref.reftype !== 'stack') {
            //    var newref = context.pushStack(ref);
            //    ref.pop();
            //    ref = newref;
            //}
            //params.push(ref);
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

        // Free all parameters
        ////while (params.length)
        ////    params.pop().pop(false);
        //context.freeQueuedObjects();

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
            + '(((((' + step.getValue() + ' > 0)|0) & ((' + loop.variable.location.getValue() + ' > ' + stop.getValue() + ')|0)))'
            + '| ((((' + step.getValue() + ' < 0)|0) & ((' + loop.variable.location.getValue() + ' < ' + stop.getValue() + ')|0)))|0)'
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
            case 'String':
                // Create pointer
                var ptr = context.getTemporary(expr.type);//context.pushStack(expr.type);
                // Get value for it
                context.push(ptr.setValue('memreserve4((' + (8 + expr.val.length) + ')|0)'));
                // Save string length
                context.push(new CompilerAbsoluteReference(Types.Char, ptr.getValue(), context).setValue(expr.val.length));
                // Set string value
                var buf = [];
                for (var i = 0; i < expr.val.length; i++) {
                    buf.push(new CompilerAbsoluteReference(Types.Char, ptr.getValue() + ' + ' + (i + 8), context).setValue(expr.val.charCodeAt(i)));
                }
                context.push(buf.join(''));

                // For now just push the pointer to the top of the stack
                var stackptr = context.pushStack(expr.type, ptr.getValue());
                ptr.pop();
                return stackptr;
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
                var operator = expr.operator;
                var comp = operator.compiler;
                var src;
                if (comp.infix) {
                    src = '(' + leftVal.type.castTo(leftVal.getValue(), comp.leftType) + ')'
                            + comp.func
                            + '(' + rightVal.type.castTo(rightVal.getValue(), comp.rightType) + ')';
                } else {
                    src = comp.func + '(' + leftVal.type.castTo(leftVal.getValue(), comp.leftType) + ','
                             + rightVal.type.castTo(rightVal.getValue(), comp.rightType) + ')';
                }

                src = comp.returnType.cast(src);
                context.push(dest.setValue(src));

                rightVal.pop();
                leftVal.pop();
                return dest;
            case 'FunctionCall':
                return this.callFunction(expr, context);
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
    this.temporaries = [];
    this.lastTemporary = 0;
    this.freeingQueue = [];
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

    pushOffset: function pushOffset() {
        this.offsets.push(this.spOffset);
    },
    popOffset: function popOffset() {
        var oldOffset = this.offsets.pop();
        this.push('SP = (SP - ' + (this.spOffset - oldOffset) + ')|0;');
        this.spOffset = oldOffset;
    },

    pushStack: function pushStack(type, value) {
        this.spOffset += type.size;
        var code = '';
        if (value && typeof value !== 'string')
            value = value.getValue();
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

    getTemporary: function getTemporary(type) {
        var res = this.temporaries.find(function find(tmp) {
            if (tmp.type === type && tmp.used === false)
                return true;

            return false;
        });

        if (!res) {
            var i = this.lastTemporary++;
            res = [];
            do {
                res.push(String.fromCharCode(97 + i % 26));
                i = (i / 26) | 0;
            } while (i > 0);
            res = res.join('');
            if (type === Types.Double)
                this.func.nodes.unshift('var ' + res + ' = 0.0;');
            else
                this.func.nodes.unshift('var ' + res + ' = 0;');
            res = new CompilerTemporaryReference(type, res, this);
            this.temporaries.push(res);
        }

        res.used = true;

        return res;
    },
    freeTemporary: function freeTemporary(tmp) {
        tmp.used = false;
    },

    queueObjectFreeing: function queueObjectFreeing(func) {
        this.freeingQueue.push(func);
    },
    freeQueuedObjects: function freeQueuedObjects() {
        while (this.freeingQueue.length) {
            this.freeingQueue.shift()();
        }
    },

    /*
     * Append code to the end of output function
     */
    push: function push(str) {
        this.func.nodes.push(str);
    },
    setFunction: function setFunction(func) {
        this.freeQueuedObjects();
        this.func = func;
        // Temporaries are only for one function
        this.temporaries = [];
        this.lastTemporary = 0;
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
        //if (editOffset !== false)
        //    editOffset = true;
        //if (this.offset + this.type.size !== this.context.spOffset && editOffset)
        //    throw new Error('Compiler popping stack in wrong order!')
        //if (!this.exists)
        //    throw new Error('Value already popped from the stack');
        //this.exists = false;
        //// Edit offset now if necessary
        //if (editOffset)
        //    this.context.spOffset -= this.type.size;
        //this.context.queueObjectFreeing(function free() {
        //    this.context.popStack(this.type.size, false);
        //}.bind(this));
    },

    reftype: "stack"
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
    pop: function pop() {
        //this.context.queueObjectFreeing(function free() {
        //    this.context.push('// Free a variable at offset "' + this.offset + '"');
        //}.bind());
    },

    reftype: "absolute"
};


function CompilerTemporaryReference(type, varname, context) {
    this.type = type;
    this.varname = varname;
    this.context = context;
}

CompilerTemporaryReference.prototype = {
    getValue: function getValue() {
        return this.type.cast(this.varname);
    },
    setValue: function setValue(value) {
        return this.varname + ' = ' + this.type.cast(value) + ';';
    },
    pop: function pop() {
        //this.context.queueObjectFreeing(function free() {
        this.context.freeTemporary(this);
        //}.bind());
    },

    reftype: "temp"
};
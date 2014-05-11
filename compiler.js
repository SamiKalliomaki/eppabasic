/// <reference path="typechecker.js" />

function Compiler(ast) {
    this.ast = ast;
    this.functions = [];
    this.buf = [];

    // For variable locations
    this.variableLocations = {};
    this.nextFreeVariableLocation = 0;

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
    defineJsFunction: function defineJsFunction(name, paramTypes, jsname, returnType, breaking, entry) {
        if (breaking !== true)
            breaking = false;
        if (!entry) {
            // Define an entry point
            entry = this.createFunction();

            var paramSize = 0;
            paramTypes.forEach(function each(param) {
                paramSize += this.getTypeSize(param);
            }.bind(this));

            entry.nodes.push(jsname + '(SP|0);');

            entry.nodes.push('SP = (SP - ' + paramSize + ')|0;');
            entry.nodes.push('CS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
        }
        this.functions.push({
            name: name,
            paramTypes: paramTypes,
            jsname: jsname,
            returnType: returnType,
            breaking: breaking,
            entry: entry
        });
    },

    /*
     * Compiles ast tree into asm.js
     */
    compile: function compile() {
        var start = this.functions.length;
        // Find user defined functions
        this.ast.nodes.forEach(function each(val) {
            if (val.nodeType === 'FunctionDefinition') {
                var paramTypes = val.params.map(function map(val) {
                    return val.type;
                })
                this.defineJsFunction(val.name, paramTypes, undefined, val.type, val.breaking, val.entry = this.createFunction());
            }
        }.bind(this));

        // Do typechecking
        this.typecheck();

        // And compiling...
        this.ast.nodes.forEach(function each(val) {
            if (val.nodeType === 'FunctionDefinition')
                this.compileFunctionDefinition(val);
        }.bind(this));


        return ('function Program(stdlib, env, heap) {\n'
                + '"use asm";\n'
                + 'var MEMS32 = new stdlib.Int32Array(heap);\n'
                + 'var MEMU32 = new stdlib.Uint32Array(heap);\n'
                + 'var MEMF32 = new stdlib.Float32Array(heap);\n'
                + 'var MEMF64 = new stdlib.Float64Array(heap);\n'
                + 'var imul = stdlib.Math.imul;\n'
                //+ 'var log = env.log;\n'                                            // Logger function TODO Revove
                + 'var SP = ' + this.nextFreeVariableLocation + ';\n'               // Stack pointer
                + 'var CS = ' + (this.nextFreeVariableLocation + 1024) + ';\n'      // Call stack pointer
                + this.compileSystemFunctionDefinitions() + '\n'

                + 'function next() {\n'
                + '\t' + this.ftableName + '[MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] & ' + this.getFTableMask() + ']();\n'
                + '}\n'

                + 'function init() {\n'
                + '\tMEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + start + ';\n'
                + '}\n'

                + this.createFunctionsCode() + '\n'
                + this.createFTable() + '\n'
                + 'return {\n'
                + '\tinit: init,\n'
                + '\tnext: next\n'
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
            curFunc: def.entry
        };

        // Find out parameter offsets
        var offset = 0;
        var i = def.params.length;
        while (i--) {
            var param = def.params[i];
            var size = this.getTypeSize(param.type);
            offset -= size;
            param.location = offset;
        }

        this.compileBlock(def.block, context);

        // Clear the reserved stack
        context.curFunc.nodes.push('SP = (SP - ' + -offset + ')|0;');
        context.curFunc.nodes.push('CS = (CS - ' + this.getTypeSize('INTEGER') + ')|0;');
        console.log(offset);
    },

    compileBlock: function compileBlock(block, context) {
        block.nodes.forEach(function each(node) {
            switch (node.nodeType) {
                case 'FunctionCall':
                    this.callFunction(node, context);
                    // Skip the result
                    if (node.type)
                        context.curFunc.nodes.push('SP = (SP - ' + this.getTypeSize(node.type) + ')|0;');
                    break;
                case 'Return':
                    break;
                default:
                    throw new Error('Unsupported node type "' + node.nodeType + '"');
            }
        }.bind(this));
    },

    /*
     * Calls a function
     */
    callFunction: function callFunction(func, context) {
        // Parameters
        func.params.forEach(function each(param) {
            this.expr(param, context);
        }.bind(this));

        // Set return function
        var retFunc = this.createFunction();

        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + retFunc.index + ';');
        context.curFunc.nodes.push('CS = (CS + ' + this.getTypeSize('INTEGER') + ')|0;');
        context.curFunc.nodes.push('MEMU32[CS >> ' + this.getTypeShift('INTEGER') + '] = ' + func.definition.entry.index + ';');

        console.log(func);

        context.curFunc = retFunc;
    },

    expr: function expr(expr, context) {
        switch (expr.nodeType) {
            case 'Number':
                context.curFunc.nodes.push(this.getMemoryType(expr.type) + '[SP >> ' + this.getTypeShift(expr.type) + '] = ' + expr.val + ';');
                context.curFunc.nodes.push('SP = (SP + ' + this.getTypeSize(expr.type) + ')|0;');
                return;
            case 'BinaryOp':

            case 'Range':

            case 'Variable':

            case 'FunctionCall':

        }
        throw new Error('Unsupported expression to be compiled "' + expr.nodeType + '"');
    },


    /*
     * Checks types of all variables and parameters
     */
    typecheck: function typecheck() {
        var checker = new Typechecker(this.ast, this.functions);
        checker.typecheck();
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

    getFreeVariableLocation: function getFreeVariableLocation(name, size) {
        // Find next location that is multiple of the size
        while (this.nextFreeVariableLocation & (size - 1))
            this.nextFreeVariableLocation++;
        var res = this.nextFreeVariableLocation;
        this.nextFreeVariableLocation += size;
        this.variableLocations[name] = res;
        return res;
    },
    getVariableLocation: function getVariableLocation(name) {
        if (!this.variableLocations[name])
            throw new Error('No location allocated for variable "' + name + '"');
        return this.variableLocations[name];
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
    writeToTypedMemory: function writeToTypedMemory(location, expr, type) {
        var shift = this.getTypeShift(type);
        var mem = this.getMemoryType(type);

        this.buffer(mem + '[' + location + ' >> ' + shift + '] = ' + this.castTo(this.expr(expr), type) + ';');
    },
    readFromTypedMemory: function readFromTypedMemor(location, type) {
        var shift = this.getTypeShift(type);
        var mem = this.getMemoryType(type);

        if (location < 0)
            location = 'SP - ' + -location;

        return mem + '[' + location + ' >> ' + shift + ']';
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

    createFunction: function createFunction() {
        var name = this.fprefix + this.nextFreeFunction;
        var ret = {
            name: name,
            index: this.nextFreeFunction,
            nodes: [],
            stackDepth: 0
        };
        this.nextFreeFunction++;

        this.createdFunctions.push(ret);

        return ret;
    },
    createFunctionsCode: function createFunctionsCode() {
        var buf = [];
        this.createdFunctions.forEach(function each(func, i) {
            buf.push('function ' + func.name + '() {');
            //buf.push('\tlog(' + i + ');');
            buf.push('\t' + func.nodes.join('\n\t'));
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
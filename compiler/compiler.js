/// <reference path="operators.js" />
/// <reference path="nodes.js" />
/// <reference path="types.js" />


function CompilerContext(types, entry) {
    /// <param name='types' type='TypeContainer' />
    /// <param name='entry' type='CompilerFunctionEntry' />
    this.types = types;
    this.func = entry;

    this.stackOffset = 0;
    this.temporaries = [];
    this.lastTemporary = 0;
}
CompilerContext.prototype = {

    reserveTemporary: function reserveTemporary(type) {
        /// <param name='type' type='BaseType' />
        /// <returns type='CompilerTemporaryReference' />
        if (!type)
            throw new Error('Type must be specified');

        // First try to find if there is already an unused temporary of right type
        var tmp = this.temporaries.find(function find(tmp) {
            if (type === this.types.Double) {
                return tmp.type === this.types.Double && tmp.used === false;
            } else {
                return tmp.type !== this.types.Double && tmp.used === false;
            }
        }.bind(this));

        if (!tmp) {
            // No temporary found so let's create a new one
            var i = this.lastTemporary++;
            tmp = [];
            do {
                tmp.push(String.fromCharCode(97 + i % 26));
                i = (i / 26) | 0;
            } while (i > 0);
            tmp = tmp.join('');

            // Add this temporary to the context
            if (type === this.types.Double)
                this.unshift('var ' + tmp + '=0.0;');
            else
                this.unshift('var ' + tmp + '=0;');
            tmp = new CompilerTemporaryReference(type, tmp, this);
            this.temporaries.push(tmp);
        }

        // This temporary is ofcourse in use...
        tmp.used = true;

        return tmp;
    },

    reserveStack: function reserveStack(type) {
        /// <param name='type' type='BaseType' />
        /// <returns type='CompilerStackReference' />
        if (!type)
            throw new Error('Type must be specified');

        // Get the size of the type
        var size = 4;
        if (type === this.types.Double)
            size = 8;
        var reserved = size;
        // Align the value in memory
        while (this.stackOffset % size != 0) {
            reserved++;
            this.stackOffset++;
        }
        // Push it to the stack
        var offset = this.stackOffset;
        this.stackOffset += size;
        this.push('SP=(SP+' + reserved + ')|0;');
        return new CompilerStackReference(type, offset, reserved, this);
    },

    reserveConstant: function reserveConstant(type) {
        /// <param name='type' type='BaseType' />
        /// <returns type='CompilerConstantReference' />
        return new CompilerConstantReference(type, this);
    },

    alignStack: function alignStack() {
        // Fill stack with nothing till next multiple of 8
        var reserved = 0;
        while (this.stackOffset % 8 != 0) {
            reserved++;
            this.stackOffset++;
        }
        this.push('SP=(SP+' + reserved + ')|0;');
        return reserved;
    },
    revertAlign: function revertAlign(reserved) {
        this.stackOffset -= reserved;
        this.push('SP=(SP-' + reserved + ')|0;');
    },

    setCallStack: function setCallStack(entry) {
        this.push('MEMU32[CP>>2]=' + entry.index + ';');
    },

    push: function push(str) {
        this.func.push(str);
    },
    unshift: function unshift(str) {
        this.func.unshift(str);
    },
    setCurrentFunction: function setCurrentFunction(entry) {
        this.func = entry;
        if (this.temporaries.some(function every(temp) { return temp.used; })) {
            console.error(this.temporaries);
            throw new Error('Not all temporaries are freed');
        }
        this.temporaries = [];
        this.lastTemporary = 0;
        this.func = entry;
    }
};

function CompilerTemporaryReference(type, name, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='name' type='String' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.name = name;
    this.context = context;
    this.used = false;
}
CompilerTemporaryReference.prototype = {
    setValue: function setValue(value) {
        var code = this.name + '=' + value.type.castTo(value.getValue(), this.type) + ';';
        this.context.push(code);
    },
    getValue: function getValue() {
        return this.name;
    },
    free: function free() {
        this.used = false;
    },
    refType: 'temp'
};
function CompilerStackReference(type, offset, reserved, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='offset' type='Number' />
    /// <param name='reserved' type='Number' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.offset = offset;
    this.reserved = reserved;
    this.context = context;
    this.types = this.context.types;
}
CompilerStackReference.prototype = {
    setValue: function setValue(value) {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        this.context.push(mem + '[((SP-' + (this.context.stackOffset - this.offset) + ')|0)>>' + shift + ']=' + value.type.castTo(value.getValue(), this.type) + ';');
    },
    getValue: function getValue() {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        return this.type.cast(mem + '[((SP-' + (this.context.stackOffset - this.offset) + ')|0)>>' + shift + ']');
    },
    free: function free() {
        // TODO Free the type
        var size = 4;
        if (this.type === this.types.Double)
            size = 8;
        if (this.context.stackOffset - size !== this.offset)
            throw new Error('Stack popped in wrong order!');
        this.context.push('SP=(SP-' + this.reserved + ')|0;');
        this.context.stackOffset -= this.reserved;
    },
    refType: 'stack'
};
function CompilerAbsoluteReference() { }
function CompilerConstantReference(type, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.context = context;
}
CompilerConstantReference.prototype = {
    setValue: function setValue(value) {
        if (typeof value !== "string")
            value = value.getValue();
        this.value = value;
    },
    getValue: function getValue() {
        return this.type.cast(this.value);
    },
    free: function free() { },
    refType: 'const'
};

function CompilerFunctionEntry(name, hasBody, paramTypes) {
    if (hasBody !== false)
        hasBody = true;
    if (!paramTypes)
        paramTypes = [];
    this.name = name;
    this.hasBody = hasBody;
    this.paramTypes = paramTypes;

    var paramStr = [];
    var paramCastStr = [];
    var paramI = 0;
    paramTypes.forEach(function each(param) {
        var name = CreateIthName(paramI++);
        paramStr.push(name);
        if (param.toString() === 'Double')
            paramCastStr.push(name + '=+' + name + ';');
        else
            paramCastStr.push(name + '=' + name + '|0;');
    }.bind(this));
    this.paramStr = paramStr.join(',');
    this.paramCastStr = paramCastStr.join('\n');
    this.nextFreeTemporary = paramI;
    this.paramNames = paramStr;

    if (hasBody) {
        this.buf = [];
    }
}
CompilerFunctionEntry.prototype = {
    push: function push(str) {
        if (!this.hasBody)
            throw new Error('Non-body function entry can not be added body');
        this.buf.push(str);
    },
    unshift: function unshift(str) {
        if (!this.hasBody)
            throw new Error('Non-body function entry can not be added body');
        this.buf.unshift(str);
    },
    toString: function toString() {
        return this.buf.join('\n');
    }
};

function Compiler(ast, operators, types) {
    /// <param name='operators' type='OperatorContainer' />
    /// <param name='types' type='TypeContainer' />
    this.ast = ast;
    this.operators = operators;
    this.types = types;

    this.env = [];
    this.functions = [];
    this.entryTypes = [];
    this.lastEntryName = 0;

    this.lastFunctionName = 0;

    this.findUserDefinedFunctions();
}

Compiler.prototype = {
    defineFunction: function defineFunction(name, parameterTypes, returnType, entryName, atomic) {
        if (atomic !== false)
            atomic = true;

    },
    defineJsFunction: function defineJsFunction(jsName, env, name, parameterTypes, returnType, atomic) {
        if (atomic !== false)
            atomic = true;

        if (env) {
            // The implementation is found in env
            // Let's copy it to a new function name
            var asmname = this.generateFunctionName();
            var entry = this.createEntry(asmname, false, parameterTypes, returnType, false);
            this.env.push('var ' + asmname + '=env.' + jsName + ';');
            // And also create an native, alternative entry
            var altname = this.generateFunctionName();
            var altEntry = this.createEntry(altname, true, parameterTypes, returnType, true);
            // Set the index of the original to this alternative one
            entry.index = altEntry.index;

            // Create a string for calling parameters
            var callStr = altEntry.paramNames.map(function map(name, index) {
                if (parameterTypes[index] === this.types.Double)
                    return '+' + name;
                else
                    return name + '|0';
            }.bind(this)).join(',');
            // And call the original function
            if (returnType) {
                if (returnType === this.types.Double)
                    altEntry.push('return +' + asmname + '(' + callStr + ');');
                else
                    altEntry.push('return ' + asmname + '(' + callStr + ')|0;');
            } else {
                altEntry.push(asmname + '(' + callStr + ');');
            }
        } else {
            // The implementation is in a module so do nothing but create an entry
            var entry = this.createEntry(jsName, true, parameterTypes, returnType);
        }

        this.functions.push({
            name: name,
            paramTypes: parameterTypes,
            returnType: returnType,
            atomic: atomic,
            entry: entry
        });
    },

    createEntry: function createEntry(name, native, paramTypes, returnType, hasBody) {
        /// <returns type='CompilerFunctionEntry' />
        if (native !== false)
            native = true;
        if (!paramTypes)
            paramTypes = [];
        if (hasBody !== false)
            hasBody = true;
        var entry = new CompilerFunctionEntry(name, hasBody, paramTypes);

        if (native) {
            var entryList = this.findEntryList(paramTypes, returnType);

            if (!entryList) {
                entryList = [];
                entryList.paramTypes = paramTypes;
                entryList.returnType = returnType;
                entryList.name = '_' + CreateIthName(this.lastEntryName++);
                this.entryTypes.push(entryList);
            }

            entryList.push(entry);
            entry.index = entryList.length - 1;
        }

        return entry;
    },
    findEntryList: function findEntryLis(paramTypes, returnType) {
        return this.entryTypes.find(function find(entryList) {
            // Test that param type lists are the same
            if (entryList.paramTypes.length !== paramTypes.length)
                return false;
            if (entryList.returnType !== returnType)
                return false;
            for (var i = 0; i < entryList.paramTypes.length; i++) {
                if (entryList.paramTypes[i] !== paramTypes[i])
                    return false;
            }
            return true;
        }.bind(this));
    },
    generateFunctionName: function generateFunctionName() {
        return '$' + CreateIthName(this.lastFunctionName++);       // Every function name begins with $ to prevent confusion with temporaries
    },
    alignEntryLists: function alignEntryLists() {
        this.entryTypes.find(function find(entryList) {
            var mask = nextPowerOfTwo(entryList.length);
            while (entryList.length < mask)
                entryList.push(entryList[0]);       // Append with the first element as it doesn't really matter which function we use
            entryList.mask = mask ? mask - 1 : 0;
        }.bind(this));
    },
    generateFTable: function generateFTable() {
        return this.entryTypes.map(function (entryList) {
            return 'var ' + entryList.name + '=[' + entryList.map(
                function (entry) {
                    return entry.name;
                }).join(',') + '];'
        }).join('\n');
    },
    generateFunctions: function generateFunctions() {
        return this.entryTypes
            .reduce(function flatten(a, b) { return a.concat(b); })         // Flatten array
            .filter(function hasBody(entry) { return entry.hasBody; })      // Filter only ones with body
            .filter(function removeDoublicates(entry, i, array) {
                return i === array.length - 1 || array.indexOf(entry, i + 1) === -1;
            })
            .map(function map(entry) {
                return 'function ' + entry.name + '(' + entry.paramStr + '){\n' + entry.paramCastStr + entry.buf.join('\n') + '\n}';
            }).join('\n')
    },


    findUserDefinedFunctions: function findUserDefinedFunctions() {
        this.ast.nodes.forEach(function each(def) {
            if (def.nodeType === 'FunctionDefinition') {
                throw new Error('User defined functions not supported yet');
            }
        }.bind(this));
    },

    // Actual code compilation
    compile: function compile() {
        // Create a special function which is used to break execution
        var breakEntry = this.createEntry('__break', undefined, undefined, this.types.Integer);
        breakEntry.push('CP=(CP-4)|0;');
        breakEntry.push('return 0;');
        // Create another special function which is used when execution is finished
        var endEntry = this.createEntry(this.generateFunctionName(), undefined, undefined, this.types.Integer);
        endEntry.push('return 0;');


        var mainEntry = this.createEntry('MAIN', undefined, undefined, this.types.Integer);
        var mainContext = new CompilerContext(this.types, mainEntry);
        this.compileBlock(this.ast, mainContext);
        // Push end entry to call stack to signal that program has ended
        mainContext.push('MEMU32[CP>>2]=' + endEntry.index + ';');
        mainContext.push('return 1;');

        // No that everything is compiled we can align entry lists
        this.alignEntryLists();

        var buf = [];
        buf.push('function Program(stdlib,env,heap){');
        buf.push('"use asm";');
        buf.push('var MEMS32=new stdlib.Int32Array(heap);');
        buf.push('var MEMU32=new stdlib.Uint32Array(heap);');
        buf.push('var MEMF64=new stdlib.Float64Array(heap);');
        buf.push('var imul=stdlib.Math.imul;');
        buf.push('var SP=0;');
        buf.push('var CP=0;');
        // Add compiler defined environmental variables
        buf.push(this.env.join('\n'));
        // Compile all the other functions
        buf.push('function __popCallStack(){CP=(CP-4)|0;}');
        buf.push('function __init(){SP=1024;CP=0;MEMU32[CP>>2]=' + mainEntry.index + ';}');
        var mainEntryList = this.findEntryList([], this.types.Integer);
        buf.push('function __next(){while(' + mainEntryList.name + '[MEMU32[CP>>2]&' + mainEntryList.mask + ']()|0);}');
        buf.push('function __breakExec(){CP=(CP+4)|0;MEMU32[CP>>2]=' + breakEntry.index + ';}');
        buf.push(this.generateFunctions());
        // Compile f-tables in the end
        buf.push(this.generateFTable());
        // Return functions
        buf.push('return {popCallStack: __popCallStack,init:__init,next:__next,breakExec:__breakExec};');
        buf.push('}');

        alert(buf.join('\n'));
        //console.log('' + mainEntry);
        //console.log(this.entryTypes);

        return buf.join('\n');
    },

    // Compiles a block
    compileBlock: function compileBlock(block, context) {
        /// <param name='block' type='Nodes.Block' />
        /// <param name='context' type='CompilerContext' />

        // Reserve space for variables
        if (block.atomic) {
            // Atomic blocks can have variables stored in temporary space
            block.variables.forEach(function each(variable) {
                variable.location = context.reserveTemporary(variable.type);
            }.bind(this));
        } else {
            // Non-atomic blocks must have variables stored in stack
            block.variables.forEach(function each(variable) {
                variable.location = context.reserveStack(variable.type);
            }.bind(this));
        }

        // Now just compile all nodes
        block.nodes.forEach(function each(node) {
            switch (node.nodeType) {
                case 'VariableDefinition':
                    this.compileVariableDefinition(node, context);
                    break;
                case 'FunctionCall':
                    var ret = this.compileFunctionCall(node, context);
                    if (ret)
                        ret.free();
                    break;
                case 'Comment':
                    context.push('/*' + node.val + '*/')
                    break;
                default:
                    throw new Error('Unsupported node type "' + node.nodeType + '"');
            }
        }.bind(this));


        // And finally free the reserved variables in reverse order
        block.variables.reverse().forEach(function each(variable) {
            variable.location.free();
        }.bind(this));
    },

    compileVariableDefinition: function compileVariableDefinition(variable, context) {
        /// <param name='variable' type='Nodes.VariableDefinition' />
        /// <param name='context' type='CompilerContext' />
        var type = variable.type;
        if (type.isArray()) {
            throw new Error('Arrays not supported, yet');
        }

        if (variable.initial) {
            variable.location.setValue(this.compileExpr(variable.initial, context));
        }
    },
    compileFunctionCall: function compileFunctionCall(call, context) {
        /// <param name='call' type='Nodes.FunctionCall' />
        /// <param name='context' type='CompilerContext' />

        // Compile parameters
        var params = [];
        call.params.forEach(function each(param) {
            if (!param.atomic) {
                // This param is not atomic so push every earlier parameter to the stack if it is not there already
                params = params.map(function each(param) {
                    if (param.refType !== 'stack' && param.refType !== 'const') {
                        // Push this to the top of the stack
                        var stackRef = context.reserveStack(param.type);
                        stackRef.setValue(param);
                        param.free();
                        param = stackRef;
                    }
                    return param;
                }.bind(this));
            }
            // Don't forget to push this to the stack
            params.push(this.compileExpr(param, context));
        }.bind(this));

        // Align the stack
        var align = context.alignStack();

        context.push('/* Calling function ' + call.name + '*/');

        var paramStr = [];
        params.forEach(function each(param, i) {
            var type = call.handle.entry.paramTypes[i];
            paramStr.push(type.cast(param.type.castTo(param.getValue(), type)));
        }.bind(this));
        var buf = [];
        buf.push(call.handle.entry.name);
        buf.push('(');
        buf.push(paramStr.join(','));
        buf.push(')');

        var retType = call.handle.returnType;
        var retVal;
        if (retType) {
            if (call.handle.returnType === this.types.Double)
                buf.unshift('+');
            else
                buf.push('|0');

            if (call.handle.atomic) {
                var cnt = context.reserveConstant(retType);
                cnt.setValue(buf.join(''));
                retVal = context.reserveTemporary(retType);
                retVal.setValue(cnt);
            } else {
                // For non-atomic functions, first set the return function
                var retFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
                context.setCallStack(retFunc);
                // ...Then call the function...
                context.push(buf.join(''));
                // ...Change the context to use the return function...
                context.push('return 1;');
                context.setCurrentFunction(retFunc);
                // ...And finally the returned value is found from the top of the stack
                var stackTop = context.reserveStack(retType);
                retVal = context.reserveTemporary(retType);
                retVal.setValue(stackTop);
                stackTop.free();
            }
        } else {
            if (call.handle.atomic) {
                context.push(buf.join(''));
            } else {
                // For non-atomic functions, first set the return function
                var retFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
                context.setCallStack(retFunc);
                // ...Then call the function...
                context.push('return 1;');
                context.push(buf.join(''));
                // ...And change the context to use the return function
                context.setCurrentFunction(retFunc);
            }
        }



        //context.push(buf.join(''));

        // Revert the stack alignment
        context.revertAlign(align);
        // And free parameters
        params.reverse().forEach(function each(param) {
            param.free();
        }.bind(this));

        return retVal;
    },

    compileExpr: function compileExpr(expr, context) {
        /// <param name='context' type='CompilerContext' />
        switch (expr.nodeType) {
            case 'Number':
                return this.compileNumberExpr(expr, context);
            case 'Variable':
                return this.compileVariableExpr(expr, context);
            case 'BinaryOp':
                return this.compileBinaryExpr(expr, context);
            case 'FunctionCall':
                return this.compileFunctionCall(expr, context);
            default:
                throw new Error('Unsupported node type "' + expr.nodeType + '"');
        }
    },
    compileNumberExpr: function compileNumberExpr(num, context) {
        /// <param name='num' type='Nodes.Number' />
        /// <param name='context' type='CompilerContext' />
        var ref = context.reserveConstant(num.type);
        ref.setValue(num.val);
        return ref;
    },
    compileVariableExpr: function compileVariableExpr(variable, context) {
        /// <param name='num' type='Nodes.Variable' />
        /// <param name='context' type='CompilerContext' />
        // Return the value as a constant expression so that the original
        // value won't be freed by accident
        var ref = context.reserveConstant(variable.type);
        ref.setValue(variable.definition.location);
        return ref;
    },
    compileBinaryExpr: function compileBinaryExpr(expr, context) {
        /// <param name='expr' type='Nodes.BinaryOp' />
        /// <param name='context' type='CompilerContext' />

        // Get the operator compilation object
        var comp = expr.operator.compiler;
        // Reserve result here first so that if it goes to the stack,
        // operands can still be popped from above
        if (expr.atomic)
            var res = context.reserveTemporary(comp.returnType);
        else
            var res = context.reserveStack(comp.returnType);
        // Compile left and right operands
        var leftRef = this.compileExpr(expr.left, context);
        var rightRef = this.compileExpr(expr.right, context);
        // Get values as string with the right kind of casting for the operator
        var left = leftRef.type.castTo(leftRef.getValue(), comp.leftType);
        var right = rightRef.type.castTo(rightRef.getValue(), comp.rightType);

        var src;
        // Compile operator depending on if it is infix or not
        if (comp.infix) {
            src = left + comp.func + right;
        } else {
            src = comp.func + '(' + left + ',' + right + ')';
        }
        // Save the expression as constant so that it can then be set to the return object
        var cnt = context.reserveConstant(comp.returnType);
        cnt.setValue(src);

        res.setValue(cnt);

        // And last but not least, return all the memory we have reserved
        rightRef.free();
        leftRef.free();
        return res;
    },
};



function CreateIthName(i) {
    buf = [];
    do {
        buf.push(String.fromCharCode(97 + i % 26));
        i = Math.floor(i / 26);
    } while (i > 0);
    return buf.join('');
}
function nextPowerOfTwo(x) {
    if (x <= 0)
        return 0;
    x--;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    x++;
    return x;
}
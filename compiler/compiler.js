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

    push: function push(str) {
        this.func.push(str);
    },
    unshift: function unshift(str) {
        this.func.unshift(str);
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
        return mem + '[((SP-' + (this.context.stackOffset - this.offset) + ')|0)>>' + shift + ']';
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

function CompilerFunctionEntry() {
    this.buf = [];
}
CompilerFunctionEntry.prototype = {
    push: function push(str) {
        this.buf.push(str);
    },
    unshift: function unshift(str) {
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

    this.lastFunctionName = 0;
}

Compiler.prototype = {
    defineFunction: function defineFunction(name, parameterTypes, returnType, entryName, atomic) {
        if (atomic !== false)
            atomic = true;

    },
    defineJsFunction: function defineJsFunction(jsName, env, name, parameterTypes, returnType, atomic) {
        if (env) {
            // The implementation is found in env
            // Let's copy it to a new function name
            var entry = this.createEntry(this.generateFunctionName);
        } else {
            // The implementation is in a module so do nothing
            var entry = this.createEntry(jsName);
        }

        // TODO!!!

        this.functions.push({
            name: name,
            paramTypes: parameterTypes,
            returnType: returnType,
            atomic: atomic
        });
    },

    createEntry: function createEntry(name) {
        /// <returns type='CompilerFunctionEntry' />
    },
    generateFunctionName: function generateFunctionName() {
        // Let's create a function name
        var i = this.lastFunctionName++;
        tmp = [];
        do {
            tmp.push(String.fromCharCode(97 + i % 26));
            i = (i / 26) | 0;
        } while (i > 0);
        tmp = tmp.join('');
        return '$' + tmp;       // Every function name begins with $ to prevent confusion with temporaries
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
        this.findUserDefinedFunctions();

        var mainEntry = new CompilerFunctionEntry();
        var mainContext = new CompilerContext(this.types, mainEntry);
        this.compileBlock(this.ast, mainContext);

        console.log('' + mainEntry);
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

        context.push('// Calling function ' + call.name);
        if (call.handle.atomic) {
            // Ok, this is a simple and nice atomic function call
            // TODO!!!
        } else {
            // Set return function
            // TODO!!!
        }

        // Revert the stack alignment
        context.revertAlign(align);
        // And free parameters
        params.reverse().forEach(function each(param) {
            param.free();
        }.bind(this));
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
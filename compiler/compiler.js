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
        this.push('SP=(SP+' + size + ')|0;');
        return new CompilerStackReference(type, offset, reserved, this);
    },

    reserveConstant: function reserveConstant(type) {
        /// <param name='type' type='BaseType' />
        /// <returns type='CompilerConstantReference' />
        return new CompilerConstantReference(type, this);
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
    }
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
}
function CompilerAbsoluteReference() { }
function CompilerConstantReference(type, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.context = context;
}
CompilerConstantReference.prototype = {
    setValue: function setValue(value) {
        this.value = value;
    },
    getValue: function getValue() {
        return this.value;
    },
    free: function free() { }
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

    this.functions = [];
}

Compiler.prototype = {
    defineFunction: function defineFunction(name, parameterTypes, returnType, entryName, atomic) {
        if (atomic !== false)
            atomic = true;
        var entry;
        if (!atomic) {
            // Non atomic function needs entry
            // Others can be without because they are called with their names
            entry = this.createEntry();
        }
    },
    defineJsFunction: function defineJsFunction() {
    },

    createEntry: function createEntry() {
        /// <returns type='CompilerFunctionEntry' />
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

    compileExpr: function compileExpr(expr, context) {
        /// <param name='context' type='CompilerContext' />
        switch (expr.nodeType) {
            case 'Number':
                return this.compileNumberExpr(expr, context);
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
    compileBinaryExpr: function compileBinaryExpr(expr, context) {
        /// <param name='expr' type='Nodes.BinaryOp' />
        /// <param name='context' type='CompilerContext' />
        var leftRef = this.compileExpr(expr.left, context);
        var rightRef = this.compileExpr(expr.right, context);
        var comp = expr.operator.compiler;
        var left = leftRef.type.castTo(leftRef.getValue(), comp.leftType);
        var right = rightRef.type.castTo(rightRef.getValue(), comp.rightType);

        var src;
        if (comp.infix) {
            src = left + comp.func + right;
        } else {
            src = comp.func + '(' + left + ',' + right + ')';
        }
        var cnt = context.reserveConstant(comp.returnType);
        cnt.setValue(src);

        var res = context.reserveTemporary(comp.returnType);
        res.setValue(cnt);

        // Also free the references
        rightRef.free();
        leftRef.free();
        return res;
    }
};
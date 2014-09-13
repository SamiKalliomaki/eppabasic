/// <reference path="framework.js" />
/// <reference path="types.js" />

define(['./framework/compileerror', './compiler/constantreference'], function (CompileError, CompilerConstantReference) {
    Nodes = {};

    /*
     * Creates a new ast for node
     */
    Nodes.For = function For(variable, block, start, stop, step, line) {
        this.variable = variable;
        this.block = block;
        this.start = start;
        this.stop = stop;
        this.step = step;
        this.line = line;
    };
    Nodes.For.prototype = {
        nodeType: 'For'
    };

    /*
     * Creates a new ast if node
     */
    Nodes.If = function If(expr, trueStatement, falseStatement, line) {
        this.expr = expr;
        this.trueStatement = trueStatement;
        this.falseStatement = falseStatement;
        this.line = line;
    };
    Nodes.If.prototype = {
        nodeType: 'If'
    };

    /*
     * Creates a new ast number node
     */
    Nodes.Number = function Number(val, line) {
        /// <field name='line' type='window.Number' />
        /// <field name='type' type='BaseType' />
        this.val = val;
        this.line = line;
    };
    Nodes.Number.prototype = {
        nodeType: 'Number'
    };

    /*
     * Creates a new ast number node
     */
    Nodes.String = function String(val, line) {
        this.val = val;
        this.line = line;
    };
    Nodes.String.prototype = {
        nodeType: 'String'
    };

    /*
     * Creates a new ast variable node
     */
    Nodes.Variable = function Variable(val, line) {
        this.val = val;
        this.line = line;
    };
    Nodes.Variable.prototype = {
        nodeType: 'Variable'
    };

    /*
     * Creates a new ast block node
     */
    Nodes.Block = function Block(nodes, line) {
        /// <field name='nodes' type='Array' />
        /// <field name='line' type='Number' />
        /// <field name='type' type='BaseType' />
        if (typeof nodes === 'number') {
            line = nodes;
            nodes = [];
        }
        this.nodes = nodes;
        this.line = line;

        this.variables = [];
        this.parent = undefined;
    };
    Nodes.Block.prototype = {
        defineVariable: function defineVariable(def, line) {
            if (this.variables.some(function some(elem) { return elem.name.toLowerCase() === def.name.toLowerCase(); })) {
                throw new CompileError(line, 'errors.variable-redefinition', { name: def.name });
            }
            this.variables.push(def);
        },
        getVariable: function getVariable(name) {
            // First try to find if the variable is defined here
            var variable = this.variables.find(function find(elem) {
                return elem.name.toLowerCase() === name.toLowerCase();
            });
            if (variable)
                return variable;
            // Then try to find it from somewhere higher in the tree
            if (this.parent)
                return this.parent.getVariable(name);
        },
        nodeType: 'Block'
    };

    Nodes.ParentNode = function ParentNode(constants) {
        this.constants = [];
        constants.forEach(function (constant) {
            var def = new Nodes.VariableDefinition(constant.name, constant.type);
            def.location = new CompilerConstantReference(constant.type);
            def.location.setValue(constant.value);
            def.constant = true;
            this.constants.push(def);
        }.bind(this));
    };
    Nodes.ParentNode.prototype = {
        getVariable: function getVariable(name) {
            return this.constants.find(function find(constant) {
                return constant.name.toLowerCase() === name.toLowerCase();
            });
        },
        nodeType:'ParentNode'
    };

    /*
     * Creates a new ast binary operator node
     */
    Nodes.BinaryOp = function BinaryOp(left, op, right, line) {
        this.left = left;
        this.op = op;
        this.right = right;
        this.line = line;
    };
    Nodes.BinaryOp.prototype = {
        nodeType: 'BinaryOp'
    };

    /*
     * Creates a new ast unary operator node
     */
    Nodes.UnaryOp = function UnaryOp(op, expr, line) {
        this.op = op;
        this.expr = expr;
        this.line = line;
    };
    Nodes.UnaryOp.prototype = {
        nodeType: 'UnaryOp'
    };

    /*
     * Creates a new ast index operator node
     */
    Nodes.IndexOp = function IndexOp(expr, index, line, line) {
        this.expr = expr;
        this.index = index;
        this.line = line;
    };
    Nodes.IndexOp.prototype = {
        nodeType: 'IndexOp'
    };

    /*
     * Creates a new ast comment node
     */
    Nodes.Comment = function Comment(val, line) {
        this.val = val;
        this.line = line;
    };
    Nodes.Comment.prototype = {
        nodeType: 'Comment'
    };

    /*
     * Creates a new ast function call node
     */
    Nodes.FunctionCall = function FunctionCall(name, params, line) {
        this.name = name;
        this.params = params;
        this.line = line;
    };
    Nodes.FunctionCall.prototype = {
        nodeType: 'FunctionCall'
    };

    /*
     * Creates a new ast variable definition node 
     */
    Nodes.VariableDefinition = function VariableDefinition(name, type, initial, dimensions, line) {
        this.name = name;
        this.type = type;
        this.initial = initial;
        this.dimensions = dimensions;
        this.line = line;
    }
    Nodes.VariableDefinition.prototype = {
        nodeType: 'VariableDefinition'
    };

    /*
     * Creates a new ast variable assignment node 
     */
    Nodes.VariableAssignment = function VariableAssignment(name, expr, index, line) {
        this.name = name;
        this.expr = expr;
        this.index = index;
        this.line = line;
    }
    Nodes.VariableAssignment.prototype = {
        nodeType: 'VariableAssignment'
    };

    /*
     * Creates a new ast function definition node 
     */
    Nodes.FunctionDefinition = function FunctionDefinition(name, params, type, block, line) {
        this.name = name;
        this.params = params;
        this.type = type;
        this.block = block;
        this.line = line;
    }
    Nodes.FunctionDefinition.prototype = {
        nodeType: 'FunctionDefinition'
    };

    /*
     * Creates a new ast return node 
     */
    Nodes.Return = function Return(expr, line) {
        this.expr = expr;
        this.line = line;
    }
    Nodes.Return.prototype = {
        nodeType: 'Return'
    };

    /*
     * Creates a new ast repeat-forever node 
     */
    Nodes.DoLoop = function DoLoop(beginCondition, endCondition, block, line) {
        this.beginCondition = beginCondition;
        this.endCondition = endCondition;
        this.block = block;
        this.line = line;
    }
    Nodes.DoLoop.prototype = {
        nodeType: 'DoLoop'
    };

    return Nodes;
});

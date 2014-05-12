

function Typechecker(ast, functions) {
    this.ast = ast;
    this.functions = functions;
}

Typechecker.prototype = {
    /*
     * Checks types of the ast
     */
    typecheck: function typecheck() {
        this.visit(this.ast);
    },

    /*
     * Visits an arbitrary node
     */
    visit: function visit(node, parent) {
        if (!this['visit' + node.nodeType])
            throw new Error('Typechecker does not implement checker for "' + node.nodeType + '" nodes');
        this['visit' + node.nodeType](node, parent);
    },

    /*
     * Visits a block. Basically just visits all children nodes.
     */
    visitBlock: function visitBlock(block, parent) {
        block.variables = [];
        block.defineVariable = function defineVariable(def) {
            if (block.variables[def.name])
                throw new Error('Redefinition of variable "' + name + '"');
            block.variables[def.name] = def;
        }
        block.getVariable = function getVariable(name) {
            if (block.variables[name])
                return block.variables[name];
            if (parent)
                return parent.getVariable(name);
        }

        block.breaking = false;
        block.nodes.forEach(function each(val) {
            this.visit(val, block);
            block.breaking = block.breaking || val.breaking;
        }.bind(this));
    },

    /*
     * A dummy visit for comment
     */
    visitComment: function visitComment(comment, parent) { },


    /*
     * Visits a variable definition
     */
    visitVariableDefinition: function visitVariableDefinition(definition, parent) {
        definition.breaking = false;
        if (!definition.type) {
            if (!definition.initial)
                throw new Error('Variable "' + definition.name + '" definition must have either type or initializer');
            definition.type = this.resolveExprType(definition.initial, parent);
        }
        if (definition.initial) {
            if (definition.type !== this.resolveExprType(definition.initial, parent))
                throw new Error('Can not cast type "' + this.resolveExprType(definition.initial, parent) + '" to "' + definition.type + '"');
            definition.breaking = definition.breaking || definition.initial.breaking;
        }
        parent.defineVariable(definition);
    },

    /*
     * Visits a for loop
     */
    visitFor: function visitFor(loop, parent) {
        loop.variable.type = this.resolveExprType(loop.range, parent);

        // Adds a custom get variable for loop iterator
        loop.getVariable = function getVariable(name) {
            if (name === loop.variable.name)
                return loop.variable;
            if (parent)
                return parent.getVariable(name);
        }

        this.visit(loop.block, loop);
        loop.breaking = loop.range.breaking || loop.block.breaking;
    },

    /*
     * Visits an if statement
     */
    visitIf: function visitIf(statement, parent) {
        statement.breaking = false;

        this.resolveExprType(statement.expr, parent);
        statement.breaking = statement.breaking || statement.expr.breaking;
        this.visit(statement.trueStatement, parent);
        statement.breaking = statement.breaking || statement.trueStatement.breaking;
        if (statement.falseStatement) {
            this.visit(statement.falseStatement, parent);
            statement.breaking = statement.breaking || statement.falseStatement.breaking;
        }
    },

    /*
     * Visits a function call
     */
    visitFunctionCall: function visitFunctionCall(call, parent) {
        // First resolve parameter types
        call.params.forEach(function each(param) {
            this.resolveExprType(param, parent);
        }.bind(this));

        // Then try to find a function accepting those parameters
        var definition = this.getFunctionDefinition(call.name, call.params);
        if (!definition)
            throw new Error('Call of an undefined function "' + call.name + '"');

        call.definition = definition;
        call.type = definition.returnType;
        call.breaking = definition.breaking;
    },

    /*
     * Visits a function definition
     */
    visitFunctionDefinition: function visitFunctionDefinition(func, parent) {
        // Adds a custom get variable for parameters
        func.getVariable = function getVariable(name) {
            var i = func.params.length;
            while (i--) {
                if (func.params[i].name === name)
                    return func.params[i];
            }
            if (parent)
                return parent.getVariable(name);
        }

        this.visit(func.block, func);
    },
    /*
     * Visits a return statement
     */
    visitReturn: function visitReturn(ret, parent) {
        ret.breaking = false;
        ret.type = this.resolveExprType(ret.expr, parent);
    },



    /*
     * Resolves the type of the expression and caches it to the expression for later use
     */
    resolveExprType: function resolveExprType(expr, context) {
        if (expr.type)
            return expr.type;

        switch (expr.nodeType) {
            case 'Number':
                expr.breaking = false;
                if (+expr.val === (expr.val | 0)) {
                    return expr.type = 'INTEGER';
                } else {
                    return expr.type = 'DOUBLE';
                }

            case 'BinaryOp':
                var leftType = this.resolveExprType(expr.left, context);
                var rightType = this.resolveExprType(expr.right, context);
                expr.breaking = expr.left.breaking || expr.right.breaking;
                if (leftType === rightType)
                    return expr.type = leftType;
                throw new Error('Unresolvable return type of a binary operator');

            case 'Range':
                var startType = this.resolveExprType(expr.start, context);
                var endType = this.resolveExprType(expr.end, context);
                expr.breaking = expr.start.breaking || expr.end.breaking;
                if (startType === endType)
                    return expr.type = startType;
                throw new Error('Unsolvable return type of a range operator');

            case 'Variable':
                var variable = context.getVariable(expr.val);
                if (!variable)
                    throw new Error('No variable called "' + expr.val + '" exists in scope');
                expr.definition = variable;
                expr.breaking = false;
                return expr.type = variable.type;

            case 'FunctionCall':
                this.visitFunctionCall(expr, context);
                return expr.type;

        }
        throw new Error('Unsupported expression to be type-resolved "' + expr.nodeType + '"');
    },

    /*
     * Gets the function definition
     */
    getFunctionDefinition: function getFunctionDefinition(name, params) {
        var i = this.functions.length;
        funcloop: while (i--) {
            if (this.functions[i].name.toLowerCase() === name.toLowerCase()
                && this.functions[i].paramTypes.length === params.length) {
                // Check all parameters one by one
                var j = params.length;
                while (j--) {
                    if (!this.canBeCasted(params[j].type, this.functions[i].paramTypes[j]))
                        continue funcloop;
                }
                return this.functions[i];
            }
        }
    },

    /*
     * Tests if one type can be implictly casted to another
     */
    canBeCasted: function canBeCasted(from, to) {
        return from === to;
    }
};
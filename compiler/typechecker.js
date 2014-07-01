/// <reference path="operators.js" />
/// <reference path="types.js" />
/// <reference path="types.js" />

function Typechecker(ast, functions, operators, types) {
    /// <param name='ast' type='Nodes.Block' />
    /// <param name='functions' type='Array' />
    /// <param name='operators' type='OperatorContainer' />
    /// <param name='types' type='Type' />
    this.ast = ast;
    this.functions = functions;
    this.operators = operators;
    this.types = types;
}

Typechecker.prototype = {
    /*
     * Checks types of the ast
     */
    check: function check() {
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
            if (block.variables.some(
                function some(elem) {
                    return elem.name.toLowerCase() === def.name.toLowerCase();
            })) {
                throw new Error('Redefinition of variable "' + name + '"');
            }
            block.variables.push(def);
        }
        block.getVariable = function getVariable(name) {
            // First try to find if the variable is defined here
            var variable = block.variables.find(function find(elem) {
                return elem.name.toLowerCase() === name.toLowerCase();
            });
            if (variable)
                return variable;
            // Then try to find it from somewhere higher in the tree
            if (parent)
                return parent.getVariable(name);
        }

        block.nodes.forEach(function each(val) {
            this.visit(val, block);
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
        if (!definition.type) {
            // No type defined -> initial value has to be defined
            if (!definition.initial)
                throw new Error('Variable "' + definition.name + '" definition must have either type or initializer');
            // Just resolve the type
            definition.type = this.resolveExprType(definition.initial, parent);
        }
        if (definition.dimensions) {
            //definition.type = this.types.getArrayType(definition.type, definition.dimensions.length);
            // This is an array -> for every dimesion, check type
            definition.dimensions.forEach(function each(dim) {
                dim.type = this.resolveExprType(dim, parent);
                if (!dim.type.canCastTo(this.types.Integer))
                    throw new Error('Array dimensions must be type of "Integer"');
            }.bind(this));
        }
        if (definition.initial) {
            // Initial is defined -> must not conflict with the type specified
            if (!this.resolveExprType(definition.initial, parent).canCastTo(definition.type))
                throw new Error('Can not cast type "' + this.resolveExprType(definition.initial, parent) + '" to "' + definition.type + '"');
        }
        // Tell the parent about this variable
        parent.defineVariable(definition);
    },

    /*
     * Visits a variable definition
     */
    visitVariableAssignment: function visitVariableAssignment(assignemnt, parent) {
        // Get reference to the variable
        var variable = parent.getVariable(assignemnt.name);
        // Check that it exists
        if (!variable)
            throw new Error('No variable called "' + assignemnt.name + '" exists in scope');

        var type = variable.type;
        // Test types for every index
        if (assignemnt.index) {
            assignemnt.index.forEach(function each(index) {
                index.type = this.resolveExprType(index, parent);
                if (!index.type.canCastTo(this.types.Integer))
                    throw new Error('Array indices must be type of "Integer"');
            }.bind(this));
            type = type.itemType;
        }

        // Save the reference
        assignemnt.ref = variable;

        // Resolve expression type
        this.resolveExprType(assignemnt.expr, parent);

        // Check that it matches the type of the variable it is assigned to
        if (!assignemnt.expr.type.canCastTo(type))
            throw new Error('Can not assign value of type "' + assignemnt.expr.type + '" to a variable of type "' + type + '"');
    },

    /*
     * Visits a for loop
     */
    visitFor: function visitFor(loop, parent) {
        loop.variable.type = this.resolveExprType(loop.start, parent);
        if (this.resolveExprType(loop.stop, parent) !== loop.variable.type)
            throw new Error('Loop end and start types must be same');
        if (!this.resolveExprType(loop.step, parent).canCastTo(loop.variable.type))
            throw new Error('Loop step type must match the iterator type');

        // Adds a custom get variable for loop iterator
        loop.getVariable = function getVariable(name) {
            if (name.toLowerCase() === loop.variable.name.toLowerCase())
                return loop.variable;
            if (parent)
                return parent.getVariable(name);
        }

        this.visit(loop.block, loop);
    },

    /*
     * Visits an if statement
     */
    visitIf: function visitIf(statement, parent) {
        this.resolveExprType(statement.expr, parent);
        this.visit(statement.trueStatement, parent);
        if (statement.falseStatement) {
            this.visit(statement.falseStatement, parent);
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
        var handle = this.getFunctionHandle(call.name, call.params);
        if (!handle)
            throw new Error('Call of an undefined function "' + call.name + '"');

        // Redefine parameter types to match function call so that the compiler can cast them
        var i = call.params.length;
        while (i--) {
            call.params[i].type = handle.paramTypes[i];
        }

        call.handle = handle;
        call.type = handle.returnType;
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
        ret.type = this.resolveExprType(ret.expr, parent);
    },

    /*
     * Visits a repeat-forever statement
     */
    visitRepeatForever: function visitRepeatForever(loop, parent) {
        this.visit(loop.block, parent);
    },
    /*
     * Visits a repeat-until statement
     */
    visitRepeatUntil: function visitRepeatUntil(loop, parent) {
        this.visit(loop.block, parent);
        this.resolveExprType(loop.expr, parent);
    },
    /*
     * Visits a repeat-while statement
     */
    visitRepeatWhile: function visitRepeatWhile(loop, parent) {
        this.visit(loop.block, parent);
        this.resolveExprType(loop.expr, parent);
    },



    /*
     * Resolves the type of the expression and caches it to the expression for later use
     */
    resolveExprType: function resolveExprType(expr, context) {
        if (expr.type)
            return expr.type;

        switch (expr.nodeType) {
            case 'Number':
                if (+expr.val === (expr.val | 0) && expr.val.indexOf('.') === -1) {
                    return expr.type = this.types.Integer;
                } else {
                    return expr.type = this.types.Double;
                }

            case 'String':
                return expr.type = this.types.String;

            case 'BinaryOp':
                var leftType = this.resolveExprType(expr.left, context);
                var rightType = this.resolveExprType(expr.right, context);
                var operator = this.operators.getOperatorByType(leftType, expr.op, rightType);
                if (!operator)
                    throw new Error('Failed to find operator \'' + expr.op + '\' for \'' + leftType + '\' and \'' + rightType + '\'');

                expr.operator = operator;
                return expr.type = operator.returnType;

            case 'IndexOp':
                var arrayType = this.resolveExprType(expr.expr, context);
                expr.index.forEach(function each(index) {
                    this.resolveExprType(index);
                    if (!index.type.canCastTo(this.types.Integer))
                        throw new Error('Array indices must be type of "Integer"');
                }.bind(this));
                return expr.type = arrayType.itemType;

            case 'Range':
                var startType = this.resolveExprType(expr.start, context);
                var endType = this.resolveExprType(expr.end, context);
                if (startType === endType)
                    return expr.type = startType;
                throw new Error('Unsolvable return type of a range operator');

            case 'Variable':
                var variable = context.getVariable(expr.val);
                if (!variable)
                    throw new Error('No variable called "' + expr.val + '" exists in scope');
                expr.definition = variable;
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
    getFunctionHandle: function getFunctionHandle(name, params) {
        // TODO First try to get with exact types, then with converted

        //// First try to get exact match
        //var i = this.functions.length;
        //funcloop: while (i--) {
        //    // First test that the names and parameter count matches
        //    if (this.functions[i].name.toLowerCase() === name.toLowerCase()
        //        && this.functions[i].paramTypes.length === params.length) {
        //        // Then that all parameters are equal with each other
        //        var j = params.length;
        //        while (j--)
        //            if (params[j].type !== this.functions[i].paramTypes[j])
        //                continue funcloop;      // Didn't match -> try next function

        //        // Found it!
        //        return this.functions[i];
        //    }
        //}

        // Didn't find anything with exact match
        // -> try that the parameters can be casted once
        var bestCastCount = ~0;
        var candidates = [];
        var i = this.functions.length;
        funcloop: while (i--) {
            // First test that the names and parameter count matches
            if (this.functions[i].name.toLowerCase() === name.toLowerCase()
                && this.functions[i].paramTypes.length === params.length) {
                // Then that all parameters can be casted 
                var castCount = 0;
                var j = params.length;
                while (j--) {
                    if (params[j].type === this.functions[i].paramTypes[j])
                        continue;                   // Good, exact match
                    if (params[j].type.canCastTo(this.functions[i].paramTypes[j])) {
                        castCount++;
                        continue;                   // Good, can be casted
                    }
                    continue funcloop;              // Ok, this ones parameters didn't match at all
                }

                if (castCount < bestCastCount) {
                    // Set the new record and clear candidates
                    bestCastCount = castCount;
                    candidates = [];
                }
                if (castCount === bestCastCount) {
                    // Save this for later use
                    candidates.push(this.functions[i]);
                }
            }
        }

        if (!candidates.length) {
            var paramStr = params.map(function map(param) { return param.type; }).join(', ');
            throw new Error('No function matches a call "' + name + '(' + paramStr + ')"');
        }
        if (candidates.length > 1) {
            var candidateStr = '\t' + candidates.map(function map(cand) { return cand.paramTypes.join(', '); }).join('\t\n');
            var paramStr = params.map(function map(param) { return param.type; }).join(', ');
            throw new Error('Ambiguous function call: "' + name + '(' + paramStr + ')" Candidates are:' + candidateStr)
        }
        return candidates[0];
    },
};
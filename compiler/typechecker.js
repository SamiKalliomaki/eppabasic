/// <reference path="operators.js" />
/// <reference path="types.js" />
/// <reference path="types.js" />

define(function () {
    function Typechecker(ast, functions, operators, types) {
        /// <param name='ast' type='Nodes.Block' />
        /// <param name='functions' type='Array' />
        /// <param name='operators' type='OperatorContainer' />
        /// <param name='types' type='Type' />
        this.ast = ast;
        this.functions = functions;
        this.operators = operators;
        this.types = types;
        this.errors = [];
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
            block.parent = parent;

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
                    this.errors.push(new CompileError(definition.line, 'errors.variable-type-or-initial', { name: definition.name }));
                // Just resolve the type
                definition.type = this.resolveExprType(definition.initial, parent);
            }
            if (definition.dimensions) {
                //definition.type = this.types.getArrayType(definition.type, definition.dimensions.length);
                // This is an array -> for every dimesion, check type
                definition.dimensions.forEach(function each(dim) {
                    dim.type = this.resolveExprType(dim, parent);
                    if (!dim.type.canCastTo(this.types.Integer))
                        this.errors.push(new CompileError(definition.line, 'errors.array-dimension-integer'));
                }.bind(this));
            }
            if (definition.initial) {
                // Initial is defined -> must not conflict with the type specified
                if (!this.resolveExprType(definition.initial, parent).canCastTo(definition.type))
                    this.errors.push(new CompileError(definition.line, 'errors.cast-failed', { from: this.resolveExprType(definition.initial, parent), to: definition.type }));
            }
            // Tell the parent about this variable
            try {
                parent.defineVariable(definition, definition.line);
            } catch (e) {
                if (e instanceof CompileError)
                    this.errors.push(e);
                else
                    throw e;
            }
        },

        /*
         * Visits a variable definition
         */
        visitVariableAssignment: function visitVariableAssignment(assignment, parent) {
            // Get reference to the variable
            var variable = parent.getVariable(assignment.name);
            // Check that it exists
            if (!variable)
                this.errors.push(new CompileError(assignment.line, 'variable-undefined', { name: assignment.name }));

            var type = variable.type;
            // Test types for every index
            if (assignment.index) {
                assignment.index.forEach(function each(index) {
                    index.type = this.resolveExprType(index, parent);
                    if (!index.type.canCastTo(this.types.Integer))
                        this.errors.push(new CompileError(assignment.line, 'errors.array-index-integer'));
                }.bind(this));
                type = type.itemType;
            }

            // Save the reference
            assignment.ref = variable;

            // Resolve expression type
            this.resolveExprType(assignment.expr, parent);

            // Check that it matches the type of the variable it is assigned to
            if (!assignment.expr.type.canCastTo(type))
                this.errors.push(new CompileError(assignment.line, 'errors.cast-failed', { from: assignment.expr.type, to: type }));
        },

        /*
         * Visits a for loop
         */
        visitFor: function visitFor(loop, parent) {
            loop.variable.type = this.resolveExprType(loop.start, parent);
            if (!this.resolveExprType(loop.stop, parent).canCastTo(loop.variable.type))
                this.errors.push(new CompileError(loop.line, 'errors.for-start-end-type'));
            if (!this.resolveExprType(loop.step, parent).canCastTo(loop.variable.type))
                this.errors.push(new CompileError(loop.line, 'errors.for-iterator-step-type'));

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
            if (!statement.expr.type.canCastTo(this.types.Boolean))
                this.errors.push(new CompileError(statement.expr.line, 'errors.cast-failed', { from: statement.expr.type, to: this.types.Boolean }));
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
            var handle = this.getFunctionHandle(call.name, call.params, call.line);
            if (!handle) {
                this.errors.push(new CompileError(call.line, 'errors.call-undefined', { name: call.name }));
                return;
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
            // TODO Find out the real type of the function encapsulated in
            if (ret.expr)
                ret.type = this.resolveExprType(ret.expr, parent);
        },

        /*
         * Visits a do-loop statement
         */
        visitDoLoop: function visitDoLoop(loop, parent) {
            if (loop.beginCondition && loop.endCondition)
                this.errors.push(new CompileError(loop.line, 'errors.do-multiple-conditions'));
            if (loop.beginCondition)
                this.resolveExprType(loop.beginCondition, parent);
            if (loop.endCondition)
                this.resolveExprType(loop.endCondition, parent);
            this.visit(loop.block, parent);
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
                        return expr.type = this.types.Double;
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
                        this.errors.push(new CompileError(expr.line, 'errors.binop-undefined', { left: leftType, op: expr.op, right: rightType }));

                    expr.operator = operator;
                    return expr.type = operator.returnType;

                case 'UnaryOp':
                    var type = this.resolveExprType(expr.expr, context);
                    var operator = this.operators.getOperatorByType(type, expr.op);
                    if (!operator)
                        this.errors.push(new CompileError(expr.line, 'errors.unnop-undefined', { op: expr.op, type: type }));
                    expr.operator = operator;
                    return expr.type = operator.returnType;

                case 'IndexOp':
                    var arrayType = this.resolveExprType(expr.expr, context);
                    expr.index.forEach(function each(index) {
                        this.resolveExprType(index, context);
                        if (!index.type.canCastTo(this.types.Integer))
                            this.errors.push(new CompileError(expr.line, 'errors.array-index-integer'));
                    }.bind(this));
                    return expr.type = arrayType.itemType;

                case 'Variable':
                    var variable = context.getVariable(expr.val);
                    if (!variable)
                        this.errors.push(new CompileError(expr.line, 'errors.variable-undefined', { name: expr.val }));
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
        getFunctionHandle: function getFunctionHandle(name, params, line) {
            var bestCastCount = 4294967295;         // Int max
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
                this.errors.push(new CompileError(line, 'errors.function-no-match', { name: name, params: paramStr }));
            }
            if (candidates.length > 1) {
                var candidateStr = '\t' + candidates.map(function map(cand) { return cand.paramTypes.join(', '); }).join('\t\n');
                var paramStr = params.map(function map(param) { return param.type; }).join(', ');
                this.errors.push(new CompileError(line, 'errors.function-many-match', { name: +name, params: paramStr, candidates: candidateStr }));
            }
            return candidates[0];
        },
    };


    return Typechecker;
});


function Atomicchecker(ast, functions) {
    this.ast = ast;
    this.functions = functions;
}

Atomicchecker.prototype = {
    /*
     * Checks atomicness of the ast
     */
    check: function typecheck() {
        // TODO Make more efficient loop!!!
        for (var i = 0; i < 100; i++)
            this.visit(this.ast);
    },

    /*
     * Visits an arbitrary node
     */
    visit: function visit(node) {
        if (!this['visit' + node.nodeType])
            throw new Error('Atomicchecker does not implement checker for "' + node.nodeType + '" nodes');
        return this['visit' + node.nodeType](node);
    },

    /*
     * Visits a block. Basically just visits all children nodes.
     */
    visitBlock: function visitBlock(block) {
        block.atomic = true;
        block.nodes.forEach(function each(val) {
            var res = this.visit(val);
            if (!res)
                block.atomic = false;
        }.bind(this));
        return block.atomic;
    },

    /*
     * A dummy visit for comment
     */
    visitComment: function visitComment(comment) {
        return comment.atomic = true;
    },
    /*
     * A dummy visit for comment variable definition
     */
    visitVariableDefinition: function visitVariableDefinition(definition) {
        if (definition.initial)
            return definition.atomic = this.visitExpr(definition.initial);
        return definition.atomic = true;
    },
    /*
     * Visits a variable assignment
     */
    visitVariableAssignment: function visitVariableAssignment(assignment) {
        return assignment.atomic = this.visitExpr(assignment.expr);
    },

    /*
     * Visits a for loop
     */
    visitFor: function visitFor(loop) {
        loop.atomic = false;

        this.visit(loop.range);
        this.visit(loop.block);

        return loop.atomic;
    },
    /*
     * Visits a range statement
     */
    visitRange: function visitRange(range) {
        range.atomic = true;
        var res = this.visitExpr(range.start);
        if (!res)
            loop.atomic = false;
        res = this.visitExpr(range.end);
        if (!res)
            loop.atomic = false;
        return range.atomic;
    },
    /*
     * Visits an if statement
     */
    visitIf: function visitIf(statement) {
        statement.atomic = false;
        this.visitExpr(statement.expr);
        this.visit(statement.trueStatement)
        if (statement.falseStatement)
            this.visit(statement.falseStatement);
        return statement.atomic;
    },

    /*
     * Visits a function call
     */
    visitFunctionCall: function visitFunctionCall(call) {
        /*if (typeof call.definition.atomic === 'undefined') {
            console.log(call);
        }*/
        call.atomic = call.definition.atomic;

        call.params.forEach(function each(param) {
            var res = this.visitExpr(param);
            if (!res)
                call.atomic = false;
        }.bind(this));
        return call.atomic;
    },

    /*
     * Visits a function definition
     */
    visitFunctionDefinition: function visitFunctionDefinition(func) {
        func.atomic = this.visit(func.block);
        if (!func.atomic) {
            this.getFunctionDefinition(func.name, func.params).atomic = func.atomic;
        }
        return func.atomic;
    },
    /*
     * Visits a return statement
     */
    visitReturn: function visitReturn(ret) {
        return ret.atomic = this.visitExpr(ret.expr);
    },

    /*
     * Visits a repeat-forever statement
     */
    visitRepeatForever: function visitRepeatForever(loop) {
        loop.atomic = false;

        this.visit(loop.block);

        return loop.atomic;
    },
    /*
     * Visits a repeat-until statement
     */
    visitRepeatUntil: function visitRepeatUntil(loop) {
        loop.atomic = false;

        this.visit(loop.block);
        this.visitExpr(loop.expr);

        return loop.atomic;
    },
    /*
     * Visits a repeat-forever statement
     */
    visitRepeatWhile: function visitRepeatWhile(loop) {
        loop.atomic = false;

        this.visit(loop.block);
        this.visitExpr(loop.expr);

        return loop.atomic;
    },

    visitExpr: function visitExpr(expr) {
        switch (expr.nodeType) {
            case 'Number':
            case 'Variable':
                return expr.atomic = true;
            case 'BinaryOp':
                expr.atomic = true;
                var res = this.visitExpr(expr.left);
                if (!res)
                    expr.atomic = false;
                res = this.visitExpr(expr.right);
                if (!res)
                    expr.atomic = false;
                return expr.atomic;
            case 'FunctionCall':
                return expr.atomic = this.visitFunctionCall(expr);
        }
        throw new Error('Unsupported expression to be atomicness-tested "' + expr.nodeType + '"');
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
}
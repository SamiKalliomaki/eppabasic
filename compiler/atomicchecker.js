

function Atomicchecker(ast, functions) {
    this.ast = ast;
    this.functions = functions;
}

Atomicchecker.prototype = {
    /*
     * Checks atomicness of the ast
     */
    check: function check() {
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
        definition.atomic = true
        if (definition.initial)
            definition.atomic = this.visitExpr(definition.initial) ? definition.atomic : false;
        if (definition.dimensions)
            definition.atomic = this.visitDimensions(definition.dimensions) ? definition.atomic : false;
        return definition.atomic;
    },
    /*
     * Visits a variable assignment
     */
    visitVariableAssignment: function visitVariableAssignment(assignment) {
        assignment.atomic = this.visitExpr(assignment.expr);
        if (assignment.index)
            assignment.atomic = this.visitDimensions(assignment.index) ? assignment.atomic : false;
        return assignment.atomic;
    },

    /*
     * Visits a for loop
     */
    visitFor: function visitFor(loop) {
        loop.atomic = this.visitExpr(loop.start);
        loop.atomic = this.visitExpr(loop.stop) ? loop.atomic : false;
        loop.atomic = this.visitExpr(loop.step) ? loop.atomic : false;
        loop.atomic = this.visit(loop.block) ? loop.atomic : false;

        return loop.atomic;
    },
    /*
     * Visits an if statement
     */
    visitIf: function visitIf(statement) {
        statement.atomic = this.visitExpr(statement.expr);
        statement.atomic = this.visit(statement.trueStatement) ? statement.atomic : false;
        if (statement.falseStatement)
            statement.atomic = this.visit(statement.falseStatement) ? statement.atomic : false;
        return statement.atomic;
    },

    /*
     * Visits a function call
     */
    visitFunctionCall: function visitFunctionCall(call) {
        call.atomic = call.handle.atomic;

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
        func.handle.atomic = func.atomic = this.visit(func.block);
        return func.atomic;
    },
    /*
     * Visits a return statement
     */
    visitReturn: function visitReturn(ret) {
        return ret.atomic = this.visitExpr(ret.expr);
    },

    /*
     * Visits a do-loop statement
     */
    visitDoLoop: function visitDoLoop(loop) {
        loop.atomic = this.visit(loop.block);

        if (loop.beginCondition)
            loop.atomic = this.visitExpr(loop.beginCondition) ? loop.atomic : false;
        if (loop.endCondition)
            loop.atomic = this.visitExpr(loop.endCondition) ? loop.atomic : false;

        return loop.atomic;
    },

    /*
     * Visits array dimensions
     */
    visitDimensions: function visitDimensions(dims) {
        var atomic = true;
        dims.forEach(function each(dim) {
            atomic = this.visitExpr(dim) ? atomic : false;
        }.bind(this));
        return dims.atomic = atomic;
    },

    visitExpr: function visitExpr(expr) {
        switch (expr.nodeType) {
            case 'Number':
            case 'String':
                return expr.atomic = true;
            case 'Variable':
                if (expr.dimensions)
                    return expr.atomic = this.visitDimensions(expr.dimensions);
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
            case 'IndexOp':
                expr.atomic = true;
                expr.atomic = this.visitExpr(expr.expr) ? expr.atomic : false;
                expr.atomic = this.visitDimensions(expr.index) ? expr.atomic : false;
                return expr.atomic;
            case 'FunctionCall':
                return expr.atomic = this.visitFunctionCall(expr);
        }
        throw new Error('Unsupported expression to be atomicness-tested "' + expr.nodeType + '"');
    },
}
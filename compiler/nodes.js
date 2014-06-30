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
    if (typeof nodes === 'number') {
        line = nodes;
        nodes = [];
    }
    this.nodes = nodes;
    this.line = line;
};
Nodes.Block.prototype = {
    nodeType: 'Block'
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
Nodes.RepeatForever = function RepeatForever(block, line) {
    this.block = block;
    this.line = line;
}
Nodes.RepeatForever.prototype = {
    nodeType: 'RepeatForever'
};
/*
 * Creates a new ast repeat-while node 
 */
Nodes.RepeatWhile = function RepeatWhile(block, expr, line) {
    this.block = block;
    this.expr = expr;
    this.line = line;
}
Nodes.RepeatWhile.prototype = {
    nodeType: 'RepeatWhile'
};

/*
 * Creates a new ast repeat-until node 
 */
Nodes.RepeatUntil = function RepeatUntil(block, expr, line) {
    this.block = block;
    this.expr = expr;
    this.line = line;
}
Nodes.RepeatUntil.prototype = {
    nodeType: 'RepeatUntil'
};


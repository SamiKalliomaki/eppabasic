Nodes = {};

/*
 * Creates a new ast for node
 */
Nodes.For = function For(variable, range, block) {
    this.variable = variable;
    this.range = range;
    this.block = block;
};
Nodes.For.prototype = {
    nodeType: 'For'
};

/*
 * Creates a new ast if node
 */
Nodes.If = function If(expr, trueStatement, falseStatement) {
    this.expr = expr;
    this.trueStatement = trueStatement;
    this.falseStatement = falseStatement;
};
Nodes.If.prototype = {
    nodeType: 'If'
};

/*
 * Creates a new ast range node
 */
Nodes.Range = function Range(start, end) {
    this.start = start;
    this.end = end;
};
Nodes.Range.prototype = {
    nodeType: 'Range'
};

/*
 * Creates a new ast number node
 */
Nodes.Number = function Number(val) {
    this.val = val;
};
Nodes.Number.prototype = {
    nodeType: 'Number'
};

/*
 * Creates a new ast variable node
 */
Nodes.Variable = function Variable(val) {
    this.val = val;
};
Nodes.Variable.prototype = {
    nodeType: 'Variable'
};

/*
 * Creates a new ast block node
 */
Nodes.Block = function Block() {
    this.nodes = [];
};
Nodes.Block.prototype = {
    nodeType: 'Block'
};

/*
 * Creates a new ast binary operator node
 */
Nodes.BinaryOp = function BinaryOp(left, op, right) {
    this.left = left;
    this.op = op;
    this.right = right;
};
Nodes.BinaryOp.prototype = {
    nodeType: 'BinaryOp'
};

/*
 * Creates a new ast comment node
 */
Nodes.Comment = function Comment(val) {
    this.val = val;
};
Nodes.Comment.prototype = {
    nodeType: 'Comment'
};

/*
 * Creates a new ast function call node
 */
Nodes.FunctionCall = function FunctionCall(name, params) {
    this.name = name;
    this.params = params;
};
Nodes.FunctionCall.prototype = {
    nodeType: 'FunctionCall'
};

/*
 * Creates a new ast variable definition node 
 */
Nodes.VariableDefinition = function VariableDefinition(name, type, initial) {
    this.name = name;
    this.type = type;
    this.initial = initial;
}
Nodes.VariableDefinition.prototype = {
    nodeType: 'VariableDefinition'
};

/*
 * Creates a new ast function definition node 
 */
Nodes.FunctionDefinition = function FunctionDefinition(name, params, type, block) {
    this.name = name;
    this.params = params;
    this.type = type;
    this.block = block;
}
Nodes.FunctionDefinition.prototype = {
    nodeType: 'FunctionDefinition'
};

/*
 * Creates a new ast retyrb node 
 */
Nodes.Return = function Return(expr) {
    this.expr = expr;
}
Nodes.Return.prototype = {
    nodeType: 'Return'
};


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
    type: 'for'
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
    type: 'if'
};

/*
 * Creates a new ast range node
 */
Nodes.Range = function Range(start, end) {
    this.start = start;
    this.end = end;
};
Nodes.Range.prototype = {
    type: 'range'
};

/*
 * Creates a new ast number node
 */
Nodes.Number = function Number(val) {
    this.val = val;
};
Nodes.Number.prototype = {
    type: 'number'
};

/*
 * Creates a new ast variable node
 */
Nodes.Variable = function Variable(val) {
    this.val = val;
};
Nodes.Variable.prototype = {
    type: 'variable'
};

/*
 * Creates a new ast block node
 */
Nodes.Block = function Block() {
    this.nodes = [];
};
Nodes.Block.prototype = {
    type: 'block'
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
    type: 'binaryop'
};

/*
 * Creates a new ast comment node
 */
Nodes.Comment = function Comment(val) {
    this.val = val;
};
Nodes.Comment.prototype = {
    type: 'comment'
};

/*
 * Creates a new ast function call node
 */
Nodes.FunctionCall = function FunctionCall(name, params) {
    this.name = name;
    this.params = params;
};
Nodes.FunctionCall.prototype = {
    type: 'functioncall'
};

/*
 * Creates a new ast definition node 
 */
Nodes.Definition = function Definition(name, def, initial) {
    this.name = name;
    this.def = def;
    this.initial = initial;
}
Nodes.Definition.prototype = {
    type:'definition'
};


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
Nodes.Range.prototype = {
    type: 'number'
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
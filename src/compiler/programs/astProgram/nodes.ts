export class Node {

}

export class IdentifierNode extends Node {
    private _value: string;
}

export class VariableReferenceNode extends Node {
    private _name: IdentifierNode;
    // Null if this is not an array
    private _arrayIndex: ExpressionNode[][];
}

export class StatementNode extends Node {

}

export class VariableAssignmentNode extends StatementNode {
    private _variable: VariableReferenceNode;
}

export class BlockNode extends Node {
    private _inner: Node[];

    addFront(statement: Node) {
        this._inner.unshift(statement);
    }

    constructor() {
        super();

        this._inner = new Array();
    }
}

export class BaseLevelBlockNode extends BlockNode {

}

export class ForNode extends BlockNode {
    private _iterator: IdentifierNode;
    private _start: ExpressionNode;
    private _stop: ExpressionNode;
    private _step: ExpressionNode;

}

export class IfNode extends Node {
    // TODO
}

export class ExpressionNode extends Node {
    // TODO
}

export class NumberNode extends Node {
    private _value: number;

    constructor(value: number) {
        super();
        this._value = value;
    }
}
export class StringNode extends Node {
    private _value: string;

    constructor(value: string) {
        super();
        this._value = value;
    }
}
export class UnaryExpressionNode extends ExpressionNode {
    private _expr: ExpressionNode;

    constructor(expr: ExpressionNode) {
        super();
        this._expr = expr;
    }
}
export class NotNode extends UnaryExpressionNode { }
export class NegationNode extends UnaryExpressionNode { }

export class BinaryExpressionNode extends ExpressionNode {
    private _left: ExpressionNode;
    private _right: ExpressionNode;
    constructor(left: ExpressionNode, right: ExpressionNode) {
        super();
        this._left = left;
        this._right = right;
    }

    set right(expr: ExpressionNode) {
        this._right = expr;
    }
    set left(expr: ExpressionNode) {
        this._left = expr;
    }
}
export class PowerNode extends BinaryExpressionNode { }
export class AdditionNode extends BinaryExpressionNode { }
export class SubstractionNode extends BinaryExpressionNode { }
export class MultiplicationNode extends BinaryExpressionNode { }
export class DivisionNode extends BinaryExpressionNode { }
export class IntegerDivisionNode extends BinaryExpressionNode { }
export class ModuloNode extends BinaryExpressionNode { }

export class ConcatenationNode extends BinaryExpressionNode { }

export class EqualNode extends BinaryExpressionNode { }
export class NotEqualNode extends BinaryExpressionNode { }
export class LessThanNode extends BinaryExpressionNode { }
export class LessOrEqualNode extends BinaryExpressionNode { }
export class GreaterThanNode extends BinaryExpressionNode { }
export class GreaterOrEqualNode extends BinaryExpressionNode { }

export class OrNode extends BinaryExpressionNode { }
export class AndNode extends BinaryExpressionNode { }
export class XorNode extends BinaryExpressionNode { }

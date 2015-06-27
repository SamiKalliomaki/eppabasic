export class Node {

}

export class For extends Node {
    private _iterator: string;
    private _start: Expression;
    private _stop: Expression;
    private _step: Expression;

}

export class If extends Node {
    // TODO
}

export class Expression extends Node {
    // TODO
}

export class Number extends Node {
    private _value: number;

    constructor(value: number) {
        super();
        this._value = value;
    }
}
export class String extends Node {
    private _value: string;

    constructor(value: string) {
        super();
        this._value = value;
    }
}
export class UnaryExpression extends Expression {
    private _expr: Expression;

    constructor(expr: Expression) {
        super();
        this._expr = expr;
    }
}
export class Not extends UnaryExpression { }
export class Negation extends UnaryExpression { }

export class BinaryExpression extends Expression {
    private _left: Expression;
    private _right: Expression;
    constructor(left: Expression, right: Expression) {
        super();
        this._left = left;
        this._right = right;
    }

    set right(expr: Expression) {
        this._right = expr;
    }
    set left(expr: Expression) {
        this._left = expr;
    }
}
export class Power extends BinaryExpression { }
export class Addtion extends BinaryExpression { }
export class Substraction extends BinaryExpression { }
export class Multiplication extends BinaryExpression { }
export class Division extends BinaryExpression { }
export class Modulo extends BinaryExpression { }

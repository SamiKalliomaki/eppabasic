import Value = require('./Value');

export class Operation {
    /**
     * Converts this operation to string for debug purposes.
     */
    toString(): string {
        throw new Error('Not implemented');
    }
}

export class BinaryOperation extends Operation {
    /**
     * Type of the operationg. Mainly used for debug printing.
     */
    protected _type: string;
    /**
     * Target register for this operation.
     */
    private _target: Value;
    /**
     * Left operand.
     */
    private _left: Value;
    /**
     * Right operand.
     */
    private _right: Value;

    /**
     * Converts the operation to a string for debug purposes.
     */
    toString(): string {
        return this._target.toString() + ' <- ' + this._type + ' ' + this._left.toString() + ', ' + this._right.toString();
    }
}

export class Add extends BinaryOperation {
    protected _type: string = 'add';
}
export class Sub extends BinaryOperation {
    protected _type: string = 'sub';
}
export class Mul extends BinaryOperation {
    protected _type: string = 'mul';
}
export class SDiv extends BinaryOperation {
    protected _type: string = 'sdiv';
}
export class UDiv extends BinaryOperation {
    protected _type: string = 'idiv';
}

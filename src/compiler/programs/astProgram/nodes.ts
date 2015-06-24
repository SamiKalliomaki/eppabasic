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

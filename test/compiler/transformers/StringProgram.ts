import Program = require('src/compiler/programs/Program');

class StringProgram implements Program {
    private _code: string;

    constructor(code: string) {
        this._code = code;
    }

    get code(): string {
        return this._code;
    }
    set code(value: string) {
        this._code = value;
    }
}

export = StringProgram;
import Program = require('src/compiler/Program');

class StringProgram implements Program {
    private _code: string;

    constructor(code: string) {
        this._code = code;
    }

    get code(): string {
        return this._code;
    }
}

export = StringProgram;

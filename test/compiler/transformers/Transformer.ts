/// <reference path="../../../lib/jasmine" />

import Transformer = require('src/compiler/transformers/Transformer');
import Program = require('src/compiler/Program');

export class TransformerSuie {

    enforceTypeTest(): void {
        var prog = new StringProgram('Some code');
        var almostProg = {code: 'Some code'};

        expect(Transformer.enforceType(prog, StringProgram)).toBe(true);
        expect(Transformer.enforceType({}, StringProgram)).toBe(false);
        expect(Transformer.enforceType(almostProg, StringProgram)).toBe(false);
    }
}

class StringProgram implements Program {
    private _code: string;

    constructor(code: string) {

    }

    get code(): string {
        return this._code;
    }
}

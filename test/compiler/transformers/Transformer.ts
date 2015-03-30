/// <reference path="../../../lib/jasmine" />
/// <reference path="../../../lib/vendor" />

import Transformer = require('src/compiler/transformers/Transformer');
import esrever = require('esrever');
import StringProgram = require('./StringProgram');

export class TransformerSuie {
    EnforceTypeTest(): void {
        var prog = new StringProgram('Some code');
        var almostProg = {code: 'Some code'};

        expect(Transformer.enforceType(prog, StringProgram)).toBe(true);
        expect(Transformer.enforceType({}, StringProgram)).toBe(false);
        expect(Transformer.enforceType(almostProg, StringProgram)).toBe(false);
    }
}

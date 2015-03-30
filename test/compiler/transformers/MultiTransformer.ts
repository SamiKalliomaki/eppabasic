/// <reference path="../../../lib/jasmine" />
/// <reference path="../../../lib/vendor" />

import Transformer = require('src/compiler/transformers/Transformer');
import MultiTransformer = require('src/compiler/transformers/MultiTransformer');
import esrever = require('esrever');
import StringProgram = require('./StringProgram');

export class MultiTransformerSuite {
    NoTransformationTest(done: () => void): void {
        var multiTransformer = new MultiTransformer([]);
        var source = new StringProgram('abc Hard String to ReVeRsE');

        multiTransformer.transform(source).then((target: StringProgram) => {
            expect(target).toEqual(source);

            done();
        });
    }

    SingleTransfomationTest(done: () => void): void {
        var multiTransformer = new MultiTransformer([
            new StringReverseTransformer()
        ]);
        var source = new StringProgram('abc Hard String to ReVeRsE');

        multiTransformer.transform(source).then((target: StringProgram) => {
            expect(target).toEqual(new StringProgram('EsReVeR ot gnirtS draH cba'));

            done();
        });
    }

    DoubleTransfomationTest(done: () => void): void {
        var multiTransformer = new MultiTransformer([
            new StringReverseTransformer(),
            new StringReverseTransformer()
        ]);
        var source = new StringProgram('abc Hard String to ReVeRsE');

        multiTransformer.transform(source).then((target: StringProgram) => {
            expect(target).toEqual(source);

            done();
        });
    }
}

class StringReverseTransformer implements Transformer {
    transform(source: StringProgram): Promise<StringProgram> {
        Transformer.enforceType(source, StringProgram);

        return new Promise<StringProgram>((resolve: (program: StringProgram) => void, reject: (error: any) => void) => {
            var reversed = esrever.reverse(source.code);
            resolve(new StringProgram(reversed));
        });
    }
}

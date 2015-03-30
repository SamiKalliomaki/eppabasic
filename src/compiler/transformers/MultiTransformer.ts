import Transformer = require('./Transformer');
import Program = require('../programs/Program');

/**
 * Transformer combining multiple transformers.
 */
class MultiTransformer implements Transformer {
    /**
     * Transformers combined in this MultiTransformer.
     */
    private _transformers: Transformer[];

    /**
     * Contructs a new MultiTransofmer.
     *
     * @param transformers Transformers to combine
     */
    constructor(transformers: Transformer[]) {
        this._transformers = transformers;
    }

    /**
     * Transforms from source program to target program.
     *
     * @param source Program to be transformed
     * @param preserve Whether the transofmer must preserve the source. Useful for optimizers. Defaults to false.
     *
     * @returns Promise of transformed program.
     */
    transform(source: Program, preserve?: boolean): Promise<Program> {
        return new Promise<Program>((resolve: (program: Program) => void, reject: (error: any) => void) => {
            var i = 0;
            var nextTransformation = (program: Program) => {
                if (i >= this._transformers.length) {
                    // Ready
                    resolve(program);
                    return;
                }

                this._transformers[i].transform(program, preserve)
                    .then(nextTransformation)
                    .catch(reject);
                i++;
            };
            nextTransformation(source);
        });
    }
}

export = MultiTransformer;

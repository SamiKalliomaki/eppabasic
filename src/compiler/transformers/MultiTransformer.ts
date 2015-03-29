import Transformer = require('./Transformer');
import Program = require('../Program');

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
     * @returns Transformed program.
     */
    transform(source: Program, preserve?: boolean): Program {
        if (this._transformers.length <= 0)
            return source;          // No transformers so just return

        var current = source;

        this._transformers.forEach((transformer: Transformer) => {
            current = transformer.transform(current);
        });

        return current;
    }
}

export = MultiTransformer;

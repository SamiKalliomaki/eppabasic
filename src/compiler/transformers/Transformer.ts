import Program = require('../Program');

/**
 * Interface for transforming programs.
 *
 * Transformations can be for example AstProgram to LinearProgram or optimizations.
 */
interface Transformer {
    /**
     * Transforms from source program to target program.
     *
     * Transformer must check its source type is acceptable.
     *
     * @param source Program to be transformed
     * @param preserve Whether the transofmer must preserve the source. Useful for optimizers. Defaults to false.
     *
     * @returns Transformed program.
     */
    transform(source: Program, preserve?: boolean): Program;
}

module Transformer {
    /**
     * Enforces program is right type.
     */
    export function enforceType(object: Program, type: any): boolean {
        return object instanceof type;
    }
}

export = Transformer;

/**
 * A function which can be called from the EppaBasic program.
 */
export interface EBFunction extends Function {
    /**
     * Signature of this function.
     */
    signature: string;
}

/**
 * Creates a new function which can be used in EppaBasic programs.
 * @param signature EppaBasic signature of the function. This is used to match function calls to this implementation.
 * @param implementation Implementation of this function.
 */
export function createFunction(signature: string, implementation: Function): EBFunction {
    var func: EBFunction = <EBFunction> implementation;
    func.signature = signature;
    return func;
}
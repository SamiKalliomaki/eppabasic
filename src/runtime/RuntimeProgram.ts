/**
 * Asm.js program in the runtime.
 */
class RuntimeProgram {
    /**
     * Code of the program.
     */
    private _code: string;
    /**
     * Compiled program in asm.js form.
     */
    private _asmjs: any;

    /**
     * Construct a new program.
     * @param code Code of the program.
     */
    constructor(code: string) {
        this._code = code;
        var Proc = new Function('stdlib', 'env', 'heap', code);
    }
}

export = RuntimeProgram;
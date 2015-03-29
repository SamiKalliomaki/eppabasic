/**
 * Target program for asm.js.
 */
class AsmjsTargetProgram {
    /**
     * Code of the compiled program.
     */
    private _code: string;
    /**
     * List of modules needed by this program.
     */
    private _modules: string[];
    /**
     * Maps function signatures to internal names needed by asm.js.
     */
    private _functions: Map<string, string>;

    /**
     * Constructs a new target program for asm.js.
     */
    constructor(code: string, modules: string[], functions: Map<string, string>) {
        // TODO: Edit code for IE 9 if detected.
        this._code = code;
        this._modules = modules;
        this._functions = functions;
    }

    /**
     * Code of the compiled program.
     * @return code of he compiled program.
     */
    get code(): string {
        return this._code;
    }
    /**
     * List of modules needed by this program.
     * @returns List of modules needed by this program.
     */
    get modules(): string[] {
        return this._modules;
    }
    /**
     * Maps function signatures to internal names needed by asm.js.
     * @returns Maps function signatures to internal names needed by asm.js.
     */
    get functions(): Map<string, string> {
        return this._functions;
    }
}

export = AsmjsTargetProgram;

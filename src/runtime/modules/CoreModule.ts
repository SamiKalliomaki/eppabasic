import Module = require('./Module');
import Runtime = require('../Runtime');
import RenderHandlerModule = require('./RenderHandlerModule');
import GraphicsModule = require('./GraphicsModule');

/**
 * Module combining core modules.
 */
class CodeModule implements Module {
    /**
     * Runtime core module is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: Map<string, Function>;

    /**
     * Initializes a new core module colletion.
     */
    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = new Map<string, Function>();

        // Combine modules
        (new RenderHandlerModule(runtime)).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        (new GraphicsModule(runtime)).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Map mapping function signatures to implementations.
     */
    getFunctions(): Map<string, Function> {
        return this._functions;
    }
}

export = CodeModule;
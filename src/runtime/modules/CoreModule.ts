import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');
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
    private _functions: util.EBFunction[];

    /**
     * Initializes a new core module colletion.
     */
    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = [];

        // Combine modules
        this._functions = this._functions.concat(new RenderHandlerModule(runtime).getFunctions());
        this._functions = this._functions.concat(new GraphicsModule(runtime).getFunctions());
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Functions defined in this module.
     */
    getFunctions(): util.EBFunction[] {
        return this._functions;
    }
}

export = CodeModule;
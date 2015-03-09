import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');

/**
 * Basic graåhics functions.
 */
class GraphicsModule implements Module {
    /**
     * Runtime graphics module is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: util.EBFunction[];

    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = [];
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Functions defined in this module.
     */
    getFunctions(): util.EBFunction[] {
        return this._functions;
    }
}

export = GraphicsModule;
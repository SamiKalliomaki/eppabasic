/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');

/**
 * Basic control flow functions.
 */
class ControlflowModule implements Module {
    /**
     * Runtime the module is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: Map<string, Function>;

    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = new Map<string, Function>();

        this._functions.set('Sub End()', (): void => {

        });
        this._functions.set('Sub Restart()', (): void => {

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

export = ControlflowModule;

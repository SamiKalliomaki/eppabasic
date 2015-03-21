/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import ControlflowModule = require('./ControlflowModule');
import GraphicsModule = require('./GraphicsModule');
import InputModue = require('./InputModule');
import MathModule = require('./MathModule');
import RenderHandlerModule = require('./RenderHandlerModule');
import StringModule = require('./StringModule');
import TimeModule = require('./TimeModule');

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
        new ControlflowModule(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new GraphicsModule(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new InputModue(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new MathModule(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new RenderHandlerModule(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new StringModule(runtime).getFunctions().forEach((func: Function, index: string) => {
            this._functions.set(index, func);
        });
        new TimeModule(runtime).getFunctions().forEach((func: Function, index: string) => {
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
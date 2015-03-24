/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');

/**
 * Basic time functions.
 */
class TimeModule implements Module {
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

        this._functions.set('Function Timer() As Double', (): number => {
            return 0;
        });
        this._functions.set('Sub Wait(Double)', (seconds: number): void => {

        });

        this._functions.set('Function Year() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Month() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Day() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Weekday() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Hour() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Minute() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Second() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function MilliSecond() As Integer', (): number => {
            return 0;
        });
        this._functions.set('Function Time() As String', (): number => {
            return 0;
        });
        this._functions.set('Function Date() As String', (): number => {
            return 0;
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

export = TimeModule;

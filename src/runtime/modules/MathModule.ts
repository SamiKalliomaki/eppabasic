/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import Random = require('random');

/**
 * Basic math functions.
 */
class MathModule implements Module {
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

        var mt19937 = Random.engines.mt19937();
        mt19937.autoSeed();

        this._functions.set('Function Rnd(Integer,Integer) As Integer', (min: number, max: number): number => {
            return Random.integer(min, max)(mt19937);
        });
        this._functions.set('Function Rnd() As Double', (): number => {
            return Random.real(0, 1, false)(mt19937);
        });
        this._functions.set('Sub Randomize(Integer)', (seed: number): void => {
            mt19937.seed(seed);
        });
        this._functions.set('Function Round(Double) As Double', (val: number): number => {
            return Math.round(val);
        });
        this._functions.set('Function Round(Double,Integer) As Double', (val: number, precision: number): number => {
            var pow = Math.pow(10, precision);
            return Math.round(val * pow) / pow;
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

export = MathModule;

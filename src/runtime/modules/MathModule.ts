import Module = require('./Module');
import Runtime = require('../Runtime');

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

        this._functions.set('Function Rnd(Integer,Integer) As Integer',() => {

        });
        this._functions.set('Function Rnd() As Double',() => {

        });
        this._functions.set('Sub Randomize()',() => {

        });
        this._functions.set('Function Round(Double) As Double',() => {

        });
        this._functions.set('Function Round(Double,Integer) As Double',() => {

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
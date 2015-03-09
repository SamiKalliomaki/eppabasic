import Module = require('./Module');
import Runtime = require('../Runtime');

/**
 * Mouse and keyboard functions.
 */
class InputModule implements Module {
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

        this._functions.set('Function KeyDown(Integer) As Boolean',() => {

        });
        this._functions.set('Function KeyUp(Integer) As Boolean',() => {

        });
        this._functions.set('Function KeyHit(Integer) As Boolean',() => {

        });
        this._functions.set('Function MouseX() As Integer',() => {

        });
        this._functions.set('Function MouseY() As Integer',() => {

        });
        this._functions.set('Function MouseDown(Integer) As Boolean',() => {

        });
        this._functions.set('Function MouseUp(Integer) As Boolean',() => {

        });
        this._functions.set('Function MouseHit(Integer) As Boolean',() => {

        });
        this._functions.set('Sub Message()',() => {

        });
        this._functions.set('Function AskNumber(String) As Double',() => {

        });
        this._functions.set('Function AskText(String) As String',() => {

        });
        this._functions.set('Function AskNumber(String) As Double',() => {

        });
        this._functions.set('Function AskText(String) As String',() => {

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

export = InputModule;
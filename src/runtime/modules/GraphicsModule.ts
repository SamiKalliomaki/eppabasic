import Module = require('./Module');
import Runtime = require('../Runtime');

/**
 * Basic graphics functions.
 */
class GraphicsModule implements Module {
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


        this._functions.set('Sub LineColor(Integer,Integer,Integer)',(r: number, g: number, b: number) => {
            var rgb = (r << 16) | (g << 8) | (b << 0);
            this._runtime.renderingContext.strokeStyle = '#' + ('000000' + rgb.toString(16)).substr(-6);
        });
        this._functions.set('Sub LineWidth(Integer)',(width: number) => {

        });
        this._functions.set('Sub FillColor(Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawLine(Integer,Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawCircle(Integer,Integer,Integer)',(x: number, y: number, r: number) => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.arc(x, y, r, 0, 2 * Math.PI, false);
            this._runtime.renderingContext.stroke();
        });
        this._functions.set('Sub FillCircle(Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawRect(Integer,Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub FillRect(Integer,Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawTriangle(Integer,Integer,Integer,Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub FillTriangle(Integer,Integer,Integer,Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawDot(Integer,Integer)',() => {

        });
        this._functions.set('Sub DrawText(Integer,Integer,String)',() => {

        });
        this._functions.set('Sub DrawText(Integer,Integer,String,Integer)',() => {

        });
        this._functions.set('Sub TextColor(Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub TextFont(String)',() => {

        });
        this._functions.set('Sub TextSize(Integer)',() => {

        });
        this._functions.set('Sub TextAlign(Integer)',() => {

        });
        this._functions.set('Sub Print(String)',() => {

        });
        this._functions.set('Sub PrintLocation(Integer,Integer)',() => {

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

export = GraphicsModule;
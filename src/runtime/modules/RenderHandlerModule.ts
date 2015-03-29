/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');;

/**
 * Core functions for rendering.
 */
class RenderHandlerModule implements Module {
    /**
     * Runtime the module is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: Map<string, Function>;

    /**
     * Initializes a new rendering handler.
     */
    constructor(runtime: Runtime) {
        this._runtime = runtime;

        this._runtime.once('init', (): void => {
            // Setup defaults
            this.setWindowSize(640, 480);
        });

        // EppaBasic funtions
        this._functions = new Map<string, Function>();

        this._functions.set('Sub SetWindowTitle(String)', (titlePtr: number): void => {
            var title = util.ebstring.fromEB(titlePtr, this._runtime);
            document.title = title;
        });
        this._functions.set('Function GetWindowTitle() As String',(): number => {
            return util.ebstring.toEB(document.title, this._runtime);
        });
        this._functions.set('Function GetWindowWidth() As Integer',(): number => {
            return window.innerWidth;
        });
        this._functions.set('Sub SetWindowWidth(Integer)', (width: number): void => {
            this.setWindowSize(width, window.innerHeight);
        });
        this._functions.set('Function GetWindowHeight() As Integer',(): number => {
            return window.innerHeight;
        });
        this._functions.set('Sub SetWindowHeight(Integer)', (height: number): void => {
            this.setWindowSize(window.innerWidth, height);
        });
        this._functions.set('Sub SetWindowSize(Integer,Integer)', (width: number, height: number): void => {
            this.setWindowSize(width, height);
        });
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Map mapping function signatures to implementations.
     */
    getFunctions(): Map<string, Function> {
        return this._functions;
    }

    /**
     * Sets window size
     * @param width Width of the window
     * @param height Height of the window
     */
    setWindowSize(width: number, height: number): void {
        var newWidth = width + (window.outerWidth - window.innerWidth);
        var newHeight = height + (window.outerHeight - window.innerHeight);
        window.resizeTo(newWidth, newHeight);
    }
}

export = RenderHandlerModule;

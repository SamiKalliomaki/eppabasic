/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');
import $ = require('jquery');

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

        // RenderHandler state
        var clearColor = '#000';

        // Create canvases for double buffering
        var backgroundCanvas = document.createElement('canvas');
        var foregroundCanvas = document.createElement('canvas');
        this._runtime.canvasHolder.appendChild(backgroundCanvas);
        this._runtime.canvasHolder.appendChild(foregroundCanvas);

        this._runtime.canvas = backgroundCanvas;

        // Hide background canvas
        backgroundCanvas.style.visibility = 'hidden';

        // EppaBasic funtions
        this._functions = new Map<string, Function>();

        this._functions.set('Sub DrawScreen()', () => {
            foregroundCanvas.getContext('2d').drawImage(backgroundCanvas, 0, 0);
            // Finally break the execution
            this._runtime.program.breakExec();
        });
        this._functions.set('Sub ClearColor(Integer,Integer,Integer)', (r: number, g: number, b: number) => {
            clearColor = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub ClearScreen()', () => {
            var originalStyle = this._runtime.renderingContext.fillStyle;
            this._runtime.renderingContext.fillStyle = clearColor;
            this._runtime.renderingContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            this._runtime.renderingContext.fillStyle = originalStyle;
        });
        this._functions.set('Sub SetWindowTitle(String)', () => {

        });
        this._functions.set('Function GetWindowTitle() As String',() => {

        });
        this._functions.set('Function GetWindowWidth() As Integer',() => {

        });
        this._functions.set('Sub SetWindowWidth(Integer)', () => {

        });
        this._functions.set('Function GetWindowHeight() As Integer',() => {

        });
        this._functions.set('Sub SetWindowHeight(Integer)', () => {

        });
        this._functions.set('Sub SetWindowSize(Integer,Integer)', () => {

        });
        this._functions.set('Function GetcanvasWidth() As Integer',() => {

        });
        this._functions.set('Sub SetCanvasWidth(Integer)', () => {

        });
        this._functions.set('Function GetCanvasHeight() As Integer',() => {

        });
        this._functions.set('Sub SetCanvasHeight(Integer)', () => {

        });
        this._functions.set('Sub SetCanvasSize(Integer,Integer)', () => {

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

export = RenderHandlerModule;

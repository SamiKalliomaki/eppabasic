/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
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

        // Create canvases for double buffering
        var canvases = [document.createElement('canvas'), document.createElement('canvas')];
        // Append them to the canvas holder
        canvases.forEach((canvas) => {
            this._runtime.canvasHolder.appendChild(canvas);
        });

        // Initialize canvases
        canvases.forEach((canvas) => {
            canvas.style.visibility = 'hidden';
        });
        // Keep track of visible canvas
        var visibleCanvas = canvases[0];
        visibleCanvas.style.visibility = 'visible';
        // Setup first background canvas for runtime
        var currentCanvasIndex = 1 % canvases.length;
        runtime.canvas = canvases[currentCanvasIndex];

        this._functions = new Map<string, Function>();
        this._functions.set('Sub DrawScreen()',() => {
            // Hide old canvas
            visibleCanvas.style.visibility = 'hidden';
            // Show current background canvas
            canvases[currentCanvasIndex].style.visibility = 'visible';
            visibleCanvas = canvases[currentCanvasIndex];
            // Update canvas index
            currentCanvasIndex = (currentCanvasIndex + 1) % canvases.length;
            // Set it as drawing canvas
            this._runtime.canvas = canvases[currentCanvasIndex];
        });

        this._functions.set('Sub ClearColor(Integer,Integer,Integer)',() => {

        });
        this._functions.set('Sub ClearScreen()',() => {

        });
        this._functions.set('Sub SetWindowTitle(String)',() => {

        });
        this._functions.set('Function GetWindowTitle() As String',() => {

        });
        this._functions.set('Function GetWindowWidth() As Integer',() => {

        });
        this._functions.set('Sub SetWindowWidth(Integer)',() => {

        });
        this._functions.set('Function GetWindowHeight() As Integer',() => {

        });
        this._functions.set('Sub SetWindowHeight(Integer)',() => {

        });
        this._functions.set('Sub SetWindowSize(Integer,Integer)',() => {

        });
        this._functions.set('Function GetcanvasWidth() As Integer',() => {

        });
        this._functions.set('Sub SetCanvasWidth(Integer)',() => {

        });
        this._functions.set('Function GetCanvasHeight() As Integer',() => {

        });
        this._functions.set('Sub SetCanvasHeight(Integer)',() => {

        });
        this._functions.set('Sub SetCanvasSize(Integer,Integer)',() => {

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
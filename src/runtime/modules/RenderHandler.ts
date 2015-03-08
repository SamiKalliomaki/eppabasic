import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');
import $ = require('jquery');

/**
 * Core functions for rendering.
 */
class RenderHandler implements Module {
    /**
     * Runtime render handler is assosiated with.
     */
    private _runtime: Runtime;
    /**
     * List of functions in this module.
     */
    private _functions: util.EBFunction[];

    /**
     * Initializes a new rendering handler.
     */
    constructor(runtime: Runtime) {
        this._runtime = runtime;

        // Create canvases for double buffering
        var canvases = [new HTMLCanvasElement(), new HTMLCanvasElement()];
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

        this._functions = [
            util.createFunction('Sub DrawScreen()', () => {
                // Hide old canvas
                visibleCanvas.style.visibility = 'hidden';
                // Show current background canvas
                canvases[currentCanvasIndex].style.visibility = 'visible';
                visibleCanvas = canvases[currentCanvasIndex];
                // Update canvas index
                currentCanvasIndex = (currentCanvasIndex + 1) % canvases.length;
                // Set it as drawing canvas
                this._runtime.canvas = canvases[currentCanvasIndex];
            })
        ];
    }

    /**
     * Gets list of functions defined in this module;
     * @returns Functions defined in this module.
     */
    getFunctions(): util.EBFunction[] {
        return this._functions;
    }
}

export = RenderHandler; 
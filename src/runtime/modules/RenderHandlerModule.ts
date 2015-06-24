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
     * Canvas shown to the user.
     */
    private _foregroundCanvas: HTMLCanvasElement;
    /**
     * Canvas used for drawing.
     */
    private _backgroundCanvas: HTMLCanvasElement;

    /**
     * Initializes a new rendering handler.
     */
    constructor(runtime: Runtime) {
        this._runtime = runtime;

        // RenderHandler state
        var clearColor = '#000';

        // Create canvases for double buffering
        this._backgroundCanvas = document.createElement('canvas');
        this._foregroundCanvas = document.createElement('canvas');

        this._runtime.canvas = this._backgroundCanvas;

        // Add handlers
        var resizeEvent = (): void => {
            this.resizeCanvasHolder();
        };

        this._runtime.once('init', (): void => {
            window.addEventListener('resize', resizeEvent);
            this._runtime.canvasHolder.appendChild(this._foregroundCanvas);

            // Setup defaults
            this.setWindowSize(640, 480);
            this.setCanvasSize(640, 480);
        });
        this._runtime.once('destroy', (): void => {
            window.removeEventListener('resize', resizeEvent);
            this._runtime.canvasHolder.removeChild(this._foregroundCanvas);
        });

        // Hide background canvas
        this._backgroundCanvas.style.visibility = 'hidden';

        // EppaBasic funtions
        this._functions = new Map<string, Function>();

        var drawScreen = (): void => {
            this._runtime.renderingContext.drawImage(this._backgroundCanvas, 0, 0);
            // Finally break the execution
            this._runtime.program.breakExec();
        };
        this._functions.set('Sub DrawScreen()', drawScreen);
        this._runtime.once('ended', drawScreen);
        this._functions.set('Sub ClearColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            clearColor = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub ClearScreen()', (): void => {
            var originalStyle = this._runtime.renderingContext.fillStyle;
            this._runtime.renderingContext.fillStyle = clearColor;
            this._runtime.renderingContext.fillRect(0, 0, this._backgroundCanvas.width, this._backgroundCanvas.height);
            this._runtime.renderingContext.fillStyle = originalStyle;

            this._runtime.emitEvent('clearscreen');
        });
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
        this._functions.set('Function GetCanvasWidth() As Integer',(): number => {
            return this._foregroundCanvas.width;
        });
        this._functions.set('Sub SetCanvasWidth(Integer)', (width: number): void => {
            this.setCanvasSize(width, this._foregroundCanvas.height);
        });
        this._functions.set('Function GetCanvasHeight() As Integer',(): number => {
            return this._foregroundCanvas.height;
        });
        this._functions.set('Sub SetCanvasHeight(Integer)', (height: number): void => {
            this.setCanvasSize(this._foregroundCanvas.width, height);
        });
        this._functions.set('Sub SetCanvasSize(Integer,Integer)', (width: number, height: number): void => {
            this.setCanvasSize(width, height);
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

     /**
      * Set canvas size
      * @param width Width of the anvas
      * @param hegiht Height of the canvas
      */
     setCanvasSize(width: number, height: number): void {
         this._foregroundCanvas.width = this._backgroundCanvas.width = width;
         this._foregroundCanvas.height = this._backgroundCanvas.height = height;

         this.resizeCanvasHolder();
     }

     /**
      * Resizes canvas holder tom match window size
      */
     private resizeCanvasHolder() {
         var canvasRatio = this._foregroundCanvas.width / this._foregroundCanvas.height;
         var windowRatio = window.innerWidth / window.innerHeight;

         var width, height;

         if (windowRatio > canvasRatio) {
             width = 100 * canvasRatio / windowRatio;
             height = 100;
         } else {
             width = 100;
             height = 100 * windowRatio / canvasRatio;
         }

         this._runtime.canvasHolder.style.width = width + '%';
         this._runtime.canvasHolder.style.height = height + '%';
     }
}

export = RenderHandlerModule;

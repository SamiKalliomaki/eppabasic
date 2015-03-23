﻿/// <reference path="../../../lib/vendor" />

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
        this._runtime.canvasHolder.appendChild(this._backgroundCanvas);
        this._runtime.canvasHolder.appendChild(this._foregroundCanvas);

        this._runtime.canvas = this._backgroundCanvas;

        // Hide background canvas
        this._backgroundCanvas.style.visibility = 'hidden';

        // EppaBasic funtions
        this._functions = new Map<string, Function>();

        this._functions.set('Sub DrawScreen()', (): void => {
            this._foregroundCanvas.getContext('2d').drawImage(this._backgroundCanvas, 0, 0);
            // Finally break the execution
            this._runtime.program.breakExec();
        });
        this._functions.set('Sub ClearColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            clearColor = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub ClearScreen()', (): void => {
            var originalStyle = this._runtime.renderingContext.fillStyle;
            this._runtime.renderingContext.fillStyle = clearColor;
            this._runtime.renderingContext.fillRect(0, 0, this._backgroundCanvas.width, this._backgroundCanvas.height);
            this._runtime.renderingContext.fillStyle = originalStyle;
        });
        this._functions.set('Sub SetWindowTitle(String)', (titlePtr: number): void => {
            var title = util.ebstirng.fromEB(titlePtr, this._runtime);
            document.title = title;
        });
        this._functions.set('Function GetWindowTitle() As String',(): number => {
            return util.ebstirng.toEB(document.title, this._runtime);
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
     }
}

export = RenderHandlerModule;

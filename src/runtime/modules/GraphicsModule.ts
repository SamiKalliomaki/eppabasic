/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');

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
    /**
     * Size of text being drawn.
     */
    private _textSize: number;
    /**
     * Horizontal alignment of text being drawn.
     */
    private _textAlign: number;
    /**
     * Font of text being drawn.
     */
    private _textFont: string;
    /**
     * Color of text being drawn.
     */
    private _textColor: string;
    /**
     * Space between lines in print measured in font size.
     */
    private _textSpacing: number;
    /**
     * X coordinate of the first print command.
     */
    private _printOriginX: number;
    /**
     * Y coordinate of the first print command.
     */
    private _printOriginY: number;
    /**
     * Offset of y coordinate of the next print command from the origin.
     */
    private _printOffsetY: number;

    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = new Map<string, Function>();

        // Setup defaults
        this._runtime.on('init', (): void => {
            this._runtime.renderingContext.textBaseline = 'top';
            this._textAlign = 1;
            this._textColor = '#fff';
            this._textFont = 'monospace';
            this._textSize = 12;
            this._textSpacing = 1.2;

            this._printOriginX = 5;
            this._printOriginY = 5;
            this._printOffsetY = 0;

            this._runtime.renderingContext.strokeStyle = '#fff';
            this._runtime.renderingContext.fillStyle = '#fff';
        });
        this._runtime.on('clearscreen', (): void => {
            this._printOffsetY = 0;
        });

        // Helper functions
        var drawString = (x: number, y: number, str: string, align?: number):void => {
            if (typeof align === 'undefined')
                align = this._textAlign;

            var ctx = this._runtime.renderingContext;

            var originalStyle = ctx.fillStyle;
            ctx.font = this._textSize + 'px ' + this._textFont;
            ctx.fillStyle = this._textColor;
            if (align === 1) ctx.textAlign = 'left';
            if (align === 2) ctx.textAlign = 'right';
            if (align === 3) ctx.textAlign = 'center';
            ctx.fillText(str, x, y);
            ctx.fillStyle = originalStyle;
        }

        this._functions.set('Sub LineColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            this._runtime.renderingContext.strokeStyle = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub LineWidth(Integer)', (width: number): void => {
            this._runtime.renderingContext.lineWidth = width;
        });
        this._functions.set('Sub FillColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            this._runtime.renderingContext.fillStyle = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub DrawLine(Integer,Integer,Integer,Integer)', (x1:number, y1: number, x2: number, y2: number): void => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.moveTo(x1, y1);
            this._runtime.renderingContext.lineTo(x2, y2);
            this._runtime.renderingContext.stroke();
        });
        this._functions.set('Sub DrawCircle(Integer,Integer,Integer)', (x: number, y: number, r: number): void => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.arc(x, y, r, 0, 2 * Math.PI, false);
            this._runtime.renderingContext.stroke();
        });
        this._functions.set('Sub FillCircle(Integer,Integer,Integer)', (x: number, y: number, r: number): void => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.arc(x, y, r, 0, 2 * Math.PI, false);
            this._runtime.renderingContext.fill();
        });
        this._functions.set('Sub DrawRect(Integer,Integer,Integer,Integer)', (x: number, y: number, width: number, height: number): void => {
            this._runtime.renderingContext.rect(x, y, width, height);
        });
        this._functions.set('Sub FillRect(Integer,Integer,Integer,Integer)', (x: number, y: number, width: number, height: number): void => {
            this._runtime.renderingContext.fillRect(x, y, width, height);
        });
        this._functions.set('Sub DrawTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.moveTo(x1, y1);
            this._runtime.renderingContext.lineTo(x2, y2);
            this._runtime.renderingContext.lineTo(x3,  y3);
            this._runtime.renderingContext.stroke();
        });
        this._functions.set('Sub FillTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void => {
            this._runtime.renderingContext.beginPath();
            this._runtime.renderingContext.moveTo(x1, y1);
            this._runtime.renderingContext.lineTo(x2, y2);
            this._runtime.renderingContext.lineTo(x3,  y3);
            this._runtime.renderingContext.stroke();
        });
        this._functions.set('Sub DrawDot(Integer,Integer)', (x: number, y: number): void => {
            this._runtime.renderingContext.rect(x, y, 1, 1);
        });
        this._functions.set('Sub DrawText(Integer,Integer,String)', (x: number, y: number, strPtr: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            drawString(x, y, str);
        });
        this._functions.set('Sub DrawText(Integer,Integer,String,Integer)', (x: number, y: number, strPtr: number, align: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            drawString(x, y, str, align);
        });
        this._functions.set('Sub TextColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            this._textColor = util.rgbToStyle(r, g, b);
        });
        this._functions.set('Sub TextFont(String)', (fontPtr: number): void => {
            this._textFont = util.ebstring.fromEB(fontPtr, this._runtime);
        });
        this._functions.set('Sub TextSize(Integer)', (size: number): void => {
            this._textSize = size;
        });
        this._functions.set('Sub TextAlign(Integer)', (align: number): void => {
            this._textAlign = align;
        });
        this._functions.set('Sub Print(String)', (strPtr: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            drawString(this._printOriginX, this._printOriginY + this._printOffsetY, str);
            this._printOffsetY += this._textSpacing * this._textSize;
        });
        this._functions.set('Sub PrintLocation(Integer,Integer)', (x: number, y: number): void => {
            this._printOriginX = x;
            this._printOriginY = y;
            this._printOffsetY = 0;
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

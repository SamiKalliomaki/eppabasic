/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');
import PIXI = require('PIXI');

enum DrawState { NONE, LINE, FILL };

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
     * PIXI.js Renderer
     */
    private _renderer: PIXI.PixiRenderer;
    /**
     * PIXI.js Stage
     */
    private _stage: PIXI.Stage;
    /**
     * Background buffer
     */
    private _buffer: PIXI.RenderTexture;
    /**
     * Background buffer sprite
     */
    private _bufferSprite: PIXI.Sprite;
    private _graphics: PIXI.Graphics;
    private _lineColor: number = 0xFFFFFF;
    private _lineWidth: number = 1;
    private _fillColor: number = 0xFFFFFF;
    private _drawState: DrawState;

    private _tempText: PIXI.Text;
    private _textCache: { [hash: string]: PIXI.Text };
    private _oldTextCache: { [hash: string]: PIXI.Text };
    private _textUsedLastFrame: Set<string>;
    private _textUsedThisFrame: Set<string>;
    private _textFont: string = 'monospace';
    private _textColor: string = '#FFFFFF';
    private _textSize: number = 20;
    private _textAlign: number = 1;
    private _textContainer: PIXI.DisplayObjectContainer;
    /**
     * Space between lines in print measured in font size.
     */
    private _textSpacing: number = 1;
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

        var initLineStyle = (): void => {
            if(this._drawState == DrawState.FILL) {
                this._graphics.endFill();
            }

            if(this._drawState != DrawState.LINE) {
                this._graphics.lineStyle(this._lineWidth, this._lineColor);
            }
        }

        var initFillStyle = (): void => {
            if(this._drawState != DrawState.FILL) {
                this._graphics.lineStyle(0);
                this._graphics.beginFill(this._fillColor);
            }
        }

        var counter = 0;
        var renderGraphics = (): void => {
            this._buffer.render(this._graphics);
            this._graphics.clear();
            this._drawState = DrawState.NONE;

            counter = 0;
        }

        var checkGraphicsRender = (add = 1): void => {
            counter += add;

            if(counter >= 1000) {
                renderGraphics();
            }
        }

        var resizeEvent = (): void => {
            this.resizeCanvasHolder();
        };

        // Setup defaults
        this._runtime.on('init', (): void => {
            this._renderer = PIXI.autoDetectRenderer(640, 480);
            document.getElementById('canvasHolder').appendChild(this._renderer.view);
            this._stage = new PIXI.Stage(0x000000);

            this._tempText = new PIXI.Text('');
            this._buffer = new PIXI.RenderTexture(640, 480);
            this._bufferSprite = new PIXI.Sprite(this._buffer);
            this._graphics = new PIXI.Graphics();
            this._textContainer = new PIXI.DisplayObjectContainer();

            this._stage.addChild(this._bufferSprite);
            // this._stage.addChild(this._graphics);

            this._drawState = DrawState.NONE;
            this._oldTextCache = {};
            this._textCache = {};
            this._textUsedThisFrame = new Set();
            this._textUsedLastFrame = new Set();

            window.addEventListener('resize', resizeEvent);
        });
        this._runtime.once('destroy', (): void => {
            window.removeEventListener('resize', resizeEvent);
            document.getElementById('canvasHolder').removeChild(this._renderer.view);
        });


        this._functions.set('Sub LineColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            this._lineColor = (r<<16) | (g<<8) | b;

            if(this._drawState == DrawState.LINE)
                this._drawState = DrawState.NONE;
        });
        this._functions.set('Sub LineWidth(Integer)', (width: number): void => {
            this._lineWidth = width;

            if(this._drawState == DrawState.LINE)
                this._drawState = DrawState.NONE;
        });
        this._functions.set('Sub FillColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
            this._fillColor = (r<<16) | (g<<8) | b;

            if(this._drawState == DrawState.FILL)
                this._drawState = DrawState.NONE;
        });
        this._functions.set('Sub DrawLine(Integer,Integer,Integer,Integer)', (x1:number, y1: number, x2: number, y2: number): void => {
            initLineStyle();
            this._graphics.moveTo(x1, y1);
            this._graphics.lineTo(x2, y2);

            checkGraphicsRender();
        });
        this._functions.set('Sub DrawCircle(Integer,Integer,Integer)', (x: number, y: number, r: number): void => {
            initLineStyle();
            this._graphics.drawCircle(x, y, r);

            checkGraphicsRender(40);
        });
        this._functions.set('Sub FillCircle(Integer,Integer,Integer)', (x: number, y: number, r: number): void => {
            initFillStyle();
            this._graphics.drawCircle(x, y, r);

            checkGraphicsRender(40);
        });
        this._functions.set('Sub DrawRect(Integer,Integer,Integer,Integer)', (x: number, y: number, width: number, height: number): void => {
            initLineStyle();
            this._graphics.drawRect(x, y, width, height);

            checkGraphicsRender();
        });
        this._functions.set('Sub FillRect(Integer,Integer,Integer,Integer)', (x: number, y: number, width: number, height: number): void => {
            initFillStyle();
            this._graphics.drawRect(x, y, width, height);

            checkGraphicsRender();
        });
        this._functions.set('Sub DrawTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void => {
            initLineStyle();

            this._graphics.drawPolygon([
                new PIXI.Point(x1, y1),
                new PIXI.Point(x2, y2),
                new PIXI.Point(x3, y3)
            ]);

            checkGraphicsRender();
        });
        this._functions.set('Sub FillTriangle(Integer,Integer,Integer,Integer,Integer,Integer)', (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void => {
            initFillStyle();

            this._graphics.drawPolygon([
                new PIXI.Point(x1, y1),
                new PIXI.Point(x2, y2),
                new PIXI.Point(x3, y3)
            ]);

            checkGraphicsRender();
        });
        this._functions.set('Sub DrawDot(Integer,Integer)', (x: number, y: number): void => {
            initFillStyle();
            this._graphics.drawRect(x, y, 1, 1);
            checkGraphicsRender();
        });
        var drawString = (x: number, y: number, strPtr: number, align?: number) => {
            align = align || this._textAlign;

            var str = util.ebstring.fromEB(strPtr, this._runtime);
            var font = this._textSize + 'px ' + this._textFont;
            var hash = font + this._textColor + str;

            var text: PIXI.Text = null;

            if(hash in this._oldTextCache) {
                text = this._oldTextCache[hash];
                this._textCache[hash] = text;
            } else if(hash in this._textCache) {
                text = this._textCache[hash];
            } else {
                if(this._textUsedThisFrame.has(hash) || this._textUsedLastFrame.has(hash)) {
                    text = new PIXI.Text(str);
                    this._textCache[hash] = text;
                } else {
                    text = this._tempText;
                    text.setText(str);
                }

                text.setStyle({
                    font: font,
                    fill: this._textColor
                });
            }

            this._textUsedThisFrame.add(hash);

            text.position = new PIXI.Point(x, y);
            if(align == 1)
                text.anchor.x = 0;
            else if(align == 2)
                text.anchor.x = 1;
            else if(align == 3)
                text.anchor.x = 0.5;

            renderGraphics();
            this._textContainer.addChild(text);
            this._buffer.render(this._textContainer);
            this._textContainer.removeChild(text);
        }
        this._functions.set('Sub DrawText(Integer,Integer,String)', (x: number, y: number, strPtr: number): void => {
            drawString(x, y, strPtr);
        });
        this._functions.set('Sub DrawText(Integer,Integer,String,Integer)', (x: number, y: number, strPtr: number, align: number): void => {
            drawString(x, y, strPtr, align);
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
            drawString(this._printOriginX, this._printOriginY + this._printOffsetY, strPtr, 1);
            this._printOffsetY += this._textSpacing * this._textSize;
        });
        this._functions.set('Sub PrintLocation(Integer,Integer)', (x: number, y: number): void => {
            this._printOriginX = x;
            this._printOriginY = y;
            this._printOffsetY = 0;
        });
        this._functions.set('Sub LineSpacing(Double)', (spacing: number): void => {
            this._textSpacing = spacing;
        });
        var resizeCanvas = (width: number, height: number) => {
            this._renderer.resize(width, height);
            this._buffer.resize(width, height, true);
        }
        this._functions.set('Function GetCanvasWidth() As Integer',(): number => {
            return this._renderer.width;
        });
        this._functions.set('Sub SetCanvasWidth(Integer)', (width: number): void => {
            resizeCanvas(width, this._renderer.height);
        });
        this._functions.set('Function GetCanvasHeight() As Integer',(): number => {
            return this._renderer.height;
        });
        this._functions.set('Sub SetCanvasHeight(Integer)', (height: number): void => {
            resizeCanvas(this._renderer.width, height);
        });
        this._functions.set('Sub SetCanvasSize(Integer,Integer)', (width: number, height: number): void => {
            resizeCanvas(width, height);
        });
        var drawScreen = (): void => {
            renderGraphics();
            this._renderer.render(this._stage);

            for(var hash in this._oldTextCache) {
                if(!(hash in this._textCache)) {
                    this._oldTextCache[hash].destroy(true);
                }
            }
            this._oldTextCache = this._textCache;
            this._textCache = {};
            this._textUsedLastFrame = this._textUsedThisFrame;
            this._textUsedThisFrame = new Set();

            // Finally break the execution
            this._runtime.program.breakExec();
        };
        this._functions.set('Sub DrawScreen()', drawScreen);
        this._runtime.once('ended', drawScreen);
        this._functions.set('Sub ClearColor(Integer,Integer,Integer)', (r: number, g: number, b: number): void => {
        });
        this._functions.set('Sub ClearScreen()', (): void => {
            this._buffer.clear();
            this._graphics.clear();
            this._printOffsetY = 0;
            this._drawState = DrawState.NONE;
        });
    }

    /**
      * Resizes canvas holder tom match window size
      */
     private resizeCanvasHolder() {
         var canvasRatio = this._renderer.width / this._renderer.height;
         var windowRatio = window.innerWidth / window.innerHeight;

         var width, height;

         if (windowRatio > canvasRatio) {
             width = 100 * canvasRatio / windowRatio;
             height = 100;
         } else {
             width = 100;
             height = 100 * windowRatio / canvasRatio;
         }

         var canvasHolder = document.getElementById('canvasHolder');
         canvasHolder.style.width = width + '%';
         canvasHolder.style.height = height + '%';
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

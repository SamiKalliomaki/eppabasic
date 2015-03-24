/// <reference path="../../../lib/vendor" />

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

        // Input state
        var keysDown = new Array(256);
        var keysHit = new Array(256);
        var mouseButtons = 0;
        var mouseX = -1;
        var mouseY = -1;
        var mouseHit = -1;
        var scale = 1;

        // Listeners
        window.addEventListener('resize', (e) => {
            scale = this._runtime.canvas.width / this._runtime.canvasHolder.offsetWidth;
        });
        document.body.addEventListener('keydown', (e) => {
            if (!keysDown[e.keyCode])
                keysHit[e.keyCode] = true;
            keysDown[e.keyCode] = true;

            e.preventDefault();
            return false;
        });
        document.body.addEventListener('keyup', (e) => {
            keysDown[e.keyCode] = false;

            e.preventDefault();
            return false;
        });
        var mouseListener = (e: MouseEvent) => {
            var boundingRect = this._runtime.canvasHolder.getBoundingClientRect();
            mouseX = (e.pageX - boundingRect.left) * scale;
            mouseY = (e.pageY - boundingRect.top) * scale;

            if (!e.buttons) {
                switch (e.which) {
                    case 0: break;
                    case 1: e.buttons = 1; break;
                    case 2: e.buttons = 4; break;
                    case 3: e.buttons = 2; break;
                }
            }
            mouseButtons = e.buttons;
            if (e.type === 'mousedown') {
                if (e.button === 0) mouseHit |= 1;
                if (e.button === 1) mouseHit |= 4;
                if (e.button === 2) mouseHit |= 2;
                if (!e.button) {
                    if (e.which === 1) mouseHit |= 1;
                    if (e.which === 2) mouseHit |= 2;
                    if (e.which === 3) mouseHit |= 4;
                }
            }
            if (e.type === 'mouseup') {
                if (e.button === 0) mouseButtons &= (~1);
                if (e.button === 1) mouseButtons &= (~4);
                if (e.button === 2) mouseButtons &= (~2);
                if (!e.button) {
                    if (e.which === 1) mouseButtons &= (~1);
                    if (e.which === 2) mouseButtons &= (~2);
                    if (e.which === 3) mouseButtons &= (~4);
                }
            }

            e.preventDefault();
            return false;
        };
        document.body.addEventListener('mousemove', mouseListener);
        document.body.addEventListener('mouseup', mouseListener);
        document.body.addEventListener('mousedown', mouseListener);

        this._functions.set('Function KeyDown(Integer) As Boolean', (keycode: number): boolean => {
            return keysDown[keycode];
        });
        this._functions.set('Function KeyUp(Integer) As Boolean', (keycode: number): boolean => {
            return !keysDown[keycode];
        });
        this._functions.set('Function KeyHit(Integer) As Boolean', (keycode: number): boolean => {
            var res = keysHit[keycode];
            keysHit[keycode] = false;
            return res;
        });
        this._functions.set('Function MouseX() As Integer', (): number => {
            return mouseX;
        });
        this._functions.set('Function MouseY() As Integer', (): number => {
            return mouseY;
        });
        this._functions.set('Function MouseDown(Integer) As Boolean', (button: number): boolean => {
            return (mouseButtons & (1 << (button - 1))) !== 0;;
        });
        this._functions.set('Function MouseUp(Integer) As Boolean', (button: number): boolean => {
            return (mouseButtons & (1 << (button - 1))) === 0;;
        });
        this._functions.set('Function MouseHit(Integer) As Boolean', (button: number): boolean => {
            if (mouseHit & (1 << (button - 1))) {
                mouseHit ^= (1 << (button - 1));
                return true;
            }
            return false;
        });
        this._functions.set('Sub Message(String)', (stdPtr: number): void => {

        });
        this._functions.set('Function AskNumber(String) As Double', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function AskText(String) As String', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function AskNumber(String) As Double', (strPtr: number): number => {
            return 0;
        });
        this._functions.set('Function AskText(String) As String', (strPtr: number): number => {
            return 0;
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

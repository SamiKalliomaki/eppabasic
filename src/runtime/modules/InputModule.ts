/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');

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
        var resizeListener = () => {
            scale = this._runtime.canvas.width / this._runtime.canvasHolder.offsetWidth;
        };
        var keydownListener = (e: KeyboardEvent) => {
            if (inMessageBox)
                return;
            if (e.keyCode === 122)      // F11 for fullscreen
                return;
            if (!keysDown[e.keyCode])
                keysHit[e.keyCode] = true;
            keysDown[e.keyCode] = true;

            e.preventDefault();
            return false;
        }
        var keyupListener = (e: KeyboardEvent) => {
            if (inMessageBox)
                return;
            keysDown[e.keyCode] = false;

            e.preventDefault();
            return false;
        };
        var mouseListener = (e: MouseEvent) => {
            if (inMessageBox)
                return;
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

        this._runtime.once('init', (): void => {
            window.addEventListener('resize', resizeListener);
            document.body.addEventListener('keydown', keydownListener);
            document.body.addEventListener('keyup', keyupListener);
            document.body.addEventListener('mousemove', mouseListener);
            document.body.addEventListener('mouseup', mouseListener);
            document.body.addEventListener('mousedown', mouseListener);
            resizeListener();
            this._runtime.on('resize', resizeListener);
        });
        this._runtime.once('destroy', (): void => {
            window.removeEventListener('resize', resizeListener);
            document.body.removeEventListener('keydown', keydownListener);
            document.body.removeEventListener('keyup', keyupListener);
            document.body.removeEventListener('mousemove', mouseListener);
            document.body.removeEventListener('mouseup', mouseListener);
            document.body.removeEventListener('mousedown', mouseListener);
            this._runtime.off('resize', resizeListener);
        });

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

        // Message helpers
        var messageBox = <HTMLDivElement> this._runtime.canvasHolder.getElementsByClassName('messageBox')[0];
        var messageBoxText = <HTMLDivElement> messageBox.getElementsByClassName('text')[0];
        var inputs = messageBox.getElementsByTagName('input');
        var messageBoxInput: HTMLInputElement;
        var messageBoxButton: HTMLInputElement;
        var inMessageBox: boolean = false;
        for (var i = 0; i < inputs.length; i++) {
            var elem = inputs.item(i);
            switch (elem.type) {
                case 'text':
                    messageBoxInput = elem;
                    break;
                case 'submit':
                    messageBoxButton = elem;
                    break;
            }
        }

        var showMessage = (msg: string, inputVisible: boolean, callback: (value: string) => void): void => {
            inMessageBox = true;
            messageBoxText.textContent = msg;
            messageBoxInput.value = '';
            if (inputVisible) {
                messageBoxInput.style.display = 'block';
            } else {
                messageBoxInput.style.display = 'none';
            }
            messageBox.style.display = 'block';

            if (inputVisible) {
                messageBoxInput.focus();
            } else {
                messageBoxButton.focus();
            }

            var listener = (e: Event) => {
                inMessageBox = false;
                messageBox.style.display = 'none';
                messageBoxButton.removeEventListener('click', listener);
                messageBoxInput.removeEventListener('keypress', filter);

                callback(messageBoxInput.value);
            };

            var filter = (e: KeyboardEvent) => {
                if(e.which == 13) {
                    listener(e);
                    return false;
                }
            }

            messageBoxButton.addEventListener('click', listener);
            messageBoxInput.addEventListener('keypress', filter);
        };

        this._functions.set('Sub Message(String)', (strPtr: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);
            this._runtime.program.breakExec();
            this._runtime.waiting = true;
            showMessage(str, false, (): void => {
                this._runtime.waiting = false;
            });
        });
        this._functions.set('Function AskNumber(String) As Double', (strPtr: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);

            this._runtime.program.breakExec();
            this._runtime.waiting = true;
            var retry = (res: string): void => {
                var output = parseFloat(res);

                if (isNaN(output)) {
                    showMessage(str, true, retry);
                } else {
                    this._runtime.program.setStackDbl(output);
                    this._runtime.waiting = false;
                }
            };
            retry(null);
        });
        this._functions.set('Function AskText(String) As String', (strPtr: number): void => {
            var str = util.ebstring.fromEB(strPtr, this._runtime);

            this._runtime.program.breakExec();
            this._runtime.waiting = true;
            showMessage(str, true, (res: string): void => {
                this._runtime.program.setStackInt(util.ebstring.toEB(res, this._runtime));
                this._runtime.waiting = false;
            });
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

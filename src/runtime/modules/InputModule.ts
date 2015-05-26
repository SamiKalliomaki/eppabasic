/// <reference path="../../../lib/vendor" />

import Module = require('./Module');
import Runtime = require('../Runtime');
import util = require('./util');

/**
 * Class representing input state
 */
class InputState {
    public mouseX: number;
    public mouseY: number;
    public keyDown: Array<boolean>;
    public keyHit: Array<boolean>;
    public keyUp: Array<boolean>;
    public mouseDown: Array<boolean>;
    public mouseHit: Array<boolean>;
    public mouseUp: Array<boolean>;

    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;

        this.keyDown = new Array(256);
        this.keyHit = new Array(256);
        this.keyUp = new Array(256);

        // Hopefully mouse never has over 32 buttons
        this.mouseDown = new Array(32);
        this.mouseHit = new Array(32);
        this.mouseUp = new Array(32);
    }

    public resetHitAndUp() {
        for(var i = 0; i < this.keyHit.length; i++)
            this.keyHit[i] = false;
        for(var i = 0; i < this.keyUp.length; i++)
            this.keyUp[i] = false;
        for(var i = 0; i < this.mouseHit.length; i++)
            this.mouseHit[i] = false;
        for(var i = 0; i < this.mouseUp.length; i++)
            this.mouseUp[i] = false;
    }
}

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

    private _scale = 1;
    private _currentState: InputState;
    private _nextState: InputState;

    constructor(runtime: Runtime) {
        this._runtime = runtime;
        this._functions = new Map<string, Function>();
        this._currentState = new InputState();
        this._nextState = new InputState();

        // Listeners
        var resizeListener = () => {
            this._scale = this._runtime.canvas.width / this._runtime.canvasHolder.offsetWidth;
        };

        var keydownListener = (e: KeyboardEvent) => {
            if (inMessageBox)
                return;
            if (e.keyCode === 122)      // F11 for fullscreen
                return;
            if (!this._nextState.keyDown[e.keyCode])
                this._nextState.keyHit[e.keyCode] = true;
            this._nextState.keyDown[e.keyCode] = true;

            e.preventDefault();
            return false;
        }

        var keyupListener = (e: KeyboardEvent) => {
            if (inMessageBox)
                return;
            if (this._nextState.keyDown[e.keyCode])
                this._nextState.keyUp[e.keyCode] = true;
            this._nextState.keyDown[e.keyCode] = false;

            e.preventDefault();
            return false;
        };

        var mouseListener = (e: MouseEvent) => {
            if (inMessageBox)
                return;

            var boundingRect = this._runtime.canvasHolder.getBoundingClientRect();
            if(!isNaN(e.pageX) && !isNaN(e.pageY)) {
                this._nextState.mouseX = (e.pageX - boundingRect.left) * this._scale;
                this._nextState.mouseY = (e.pageY - boundingRect.top) * this._scale;
            }

            var button: number;

            // Remap the buttons
            if(e.button) {
                switch(e.button) {
                    case 0:
                        button = 1;
                        break;
                    case 1:
                        button = 3;
                        break;
                    case 2:
                        button = 2;
                        break;
                    case 3:
                        button = 4;
                        break;
                    case 4:
                        button = 5;
                        break;
                    default:
                        button = e.button + 1;
                }
            } else {
                switch(e.which) {
                    case 1:
                        button = 1;
                        break;
                    case 2:
                        button = 3;
                        break;
                    case 3:
                        button = 2;
                        break;
                    default:
                        button = e.which;
                }
            }

            if (e.type === 'mousedown') {
                if(!this._nextState.mouseDown[button])
                    this._nextState.mouseHit[button] = true;
                this._nextState.mouseDown[button] = true;
            }
            if (e.type === 'mouseup') {
                if(this._nextState.mouseDown[button])
                    this._nextState.mouseUp[button] = true;
                this._nextState.mouseDown[button] = false;
            }

            e.preventDefault();
            return false;
        };

        var drawscreenListener = () => {
            this._currentState = this._nextState;
            this._nextState.resetHitAndUp();
        };

        var preventListener = (e: Event) => {
            e.preventDefault();
            return false;
        }

        this._runtime.once('init', (): void => {
            window.addEventListener('resize', resizeListener);
            document.body.addEventListener('keydown', keydownListener);
            document.body.addEventListener('keyup', keyupListener);
            document.body.addEventListener('mousemove', mouseListener);
            document.body.addEventListener('mouseup', mouseListener);
            document.body.addEventListener('mousedown', mouseListener);
            document.body.addEventListener('contextmenu', preventListener);
            resizeListener();
            this._runtime.on('resize', resizeListener);
            this._runtime.on('drawscreen', drawscreenListener);
        });
        this._runtime.once('destroy', (): void => {
            window.removeEventListener('resize', resizeListener);
            document.body.removeEventListener('keydown', keydownListener);
            document.body.removeEventListener('keyup', keyupListener);
            document.body.removeEventListener('mousemove', mouseListener);
            document.body.removeEventListener('mouseup', mouseListener);
            document.body.removeEventListener('mousedown', mouseListener);
            document.body.removeEventListener('contextmenu', preventListener);
            this._runtime.off('resize', resizeListener);
            this._runtime.off('drawscreen', drawscreenListener);
        });

        this._functions.set('Function KeyDown(Integer) As Boolean', (keycode: number): boolean => {
            return this._currentState.keyDown[keycode];
        });
        this._functions.set('Function KeyUp(Integer) As Boolean', (keycode: number): boolean => {
            return this._currentState.keyUp[keycode];
        });
        this._functions.set('Function KeyHit(Integer) As Boolean', (keycode: number): boolean => {
            return this._currentState.keyHit[keycode];
        });
        this._functions.set('Function MouseX() As Integer', (): number => {
            return this._currentState.mouseX;
        });
        this._functions.set('Function MouseY() As Integer', (): number => {
            return this._currentState.mouseY;
        });
        this._functions.set('Function MouseDown(Integer) As Boolean', (button: number): boolean => {
            return this._currentState.mouseDown[button];
        });
        this._functions.set('Function MouseUp(Integer) As Boolean', (button: number): boolean => {
            return this._currentState.mouseUp[button];
        });
        this._functions.set('Function MouseHit(Integer) As Boolean', (button: number): boolean => {
            return this._currentState.mouseHit[button];
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

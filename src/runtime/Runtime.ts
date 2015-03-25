/// <reference path="../../lib/vendor" />

import i18n = require('i18n');
import $ = require('jquery');
import EventEmitter = require('EventEmitter');
import Editor = require('editor/editor');
import ModuleLoader = require('./ModuleLoader');
import AsmjsTargetProgram = require('compiler/AsmjsTargetProgram');
import Module = require('./modules/Module');

/**
 * Handles everything related to runtime.
 */
class Runtime extends EventEmitter {
    /**
     * Editor object related which opened the runtime.
     */
    private _editor: Editor;
    /**
     * The program runtime runs.
     */
    private _program: AsmjsTargetProgram.AsmjsProgram;
    /**
     * Original AsmjsTargetProgram.
     */
    private _targetProgram: AsmjsTargetProgram;
    /**
     * Holder element for canvases.
     */
    private _canvasHolder: HTMLDivElement;
    /**
     * Current rendering canvas.
     */
    private _canvas: HTMLCanvasElement;
    /**
     * Current rendering canvas.
     */
    private _renderingContext: CanvasRenderingContext2D;
    /**
     * Promise of program initialization
     */
    private _initPromise: Promise<void>;
    /**
     * Heap of the program.
     */
    private _heap: ArrayBuffer;
    /**
     * Weather the program is running.
     */
    private _running: boolean;
    /**
     * Time the next frame should not be drawn before
     */
    private _nextFrame: number;
    /**
     * Whether runtime is waiting for something.
     */
    private _waiting: boolean;

    /**
     * Constructs a new runtime.
     */
    constructor() {
        super();

        // Setup locals
        this._editor = null;
        this._program = null;
        this._targetProgram = null;
        this._canvasHolder = null;
        this._canvas = null;
        this._renderingContext = null;
        this._initPromise = null;
        this._heap = null;
        this._running = false;
        this._nextFrame = 0;
        this._waiting = false;

        // Initialize i18n
        i18n.init(
            {
                cookieName: 'lang',
                fallbackLng: 'en-US',
                resGetPath: '../locales/__lng__/__ns__.json'
            }, function (t) {
                $('body').i18n();
            });
        i18n.loadNamespace('runtime');

        // Wait for window to be fully loaded
        $(() => {
            // Get editor from the opener
            var editor = window.opener['ebeditor'];

            // And canvas holder
            this._canvasHolder = <HTMLDivElement> document.getElementById('canvasHolder');

            // Tell editor of us
            this._editor = editor;
            this._editor.setRuntime(this);

            // When the window closes editor has no runtime
            $(window).unload(function () {
                editor.setRuntime(null);
            });

            // Signal that we are ready
            this._editor.runtimeReady();
        });
    }

    /**
     * Holder element for canvases.
     */
    get canvasHolder(): HTMLDivElement {
        return this._canvasHolder;
    }
    /**
     * Current rendering canvas.
     */
    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    /**
     * Current rendering canvas.
     */
    set canvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this._renderingContext = canvas.getContext('2d');
    }
    /**
     * Rendering context to be used when rendering.
     */
    get renderingContext(): CanvasRenderingContext2D {
        return this._renderingContext;
    }
    /**
     * Heap of the array buffer.
     */
    get heap(): ArrayBuffer {
        return this._heap;
    }
    /**
     * The program runtime runs.
     */
    get program(): AsmjsTargetProgram.AsmjsProgram {
        return this._program;
    }
    /**
     * Whether runtime is waiting for something.
     */
    get waiting(): boolean {
        return this._waiting;
    }
    /**
     * Whether runtime is waiting for something.
     */
    set waiting(waiting: boolean) {
        this._waiting = waiting;
    }

    /**
     * Closes runtime.
     */
    close() {
        if (window && window.close)
            window.close();
    }
    /**
     * Initializes runtime.
     * @param code Asm.js code to be used.
     */
    init(program: AsmjsTargetProgram) {
        var moduleLoader = new ModuleLoader(program.modules);
        this._targetProgram = program;

        this._initPromise = new Promise<void>((resolve: (value: void) => void, reject: (error: any) => void): void=> {
            moduleLoader.loaded((modules: Module.Constructor[]): void => {
                // Create externals for asm.js program
                var stdlib = {
                    Math: Math,
                    Uint8Array: Uint8Array,
                    Int32Array: Int32Array,
                    Uint32Array: Uint32Array,
                    Float32Array: Float32Array,
                    Float64Array: Float64Array
                };
                var environment = {
                    heapSize: 16 * 1024 * 1024              // TODO Get heap size from elsewhere
                };
                this._heap = new ArrayBuffer(environment.heapSize);

                // Combine all defined functions in to one signature implementation map
                var functions = new Map<string, Function>();
                modules.forEach((module: Module.Constructor): void => {
                    // Construct module
                    var moduleInstance = new module(this);
                    // Get functions
                    moduleInstance.getFunctions().forEach((func: Function, index: string): void => {
                        functions.set(index, func);
                    });
                });

                // Create program environment based on requested functions
                program.functions.forEach((signature: string, internalName: string): void => {
                    environment[internalName] = functions.get(signature);
                });

                environment['panic'] = this.panic.bind(this);

                // Create program
                this._program = program.programFactory(stdlib, environment, this._heap);

                // And initialize it
                this._program.init();

                this.emitEvent('init');

                resolve(null);
            });
        });
    }
    /**
     * Starts runtime as soon as it is loaded
     */
    start() {
        this._initPromise.then(() => {
            // Program is created
            var step = () => {
                var now = (new Date()).getTime();

                if (now < this._nextFrame || this._waiting) {
                    window.requestAnimationFrame(step);
                    return;
                }

                try {
                    if (!this.program.next()) {
                        // Program has ended
                        this.emitEvent('ended');
                    } else if (this._running)
                        window.requestAnimationFrame(step);
                } catch (e) {
                    if (e instanceof Runtime.Panic) {
                        this.stop();
                        return;
                    }
                    if (e instanceof Runtime.End) {
                        this.stop();
                        if (window && window.close())
                            window.close();
                        return;
                    }
                    if (e instanceof Runtime.Restart) {
                        this.stop();
                        this.emitEvent('destroy');
                        this.init(this._targetProgram);
                        this.start();
                        return;
                    }
                    throw e;
                }
            }
            this._running = true;
            window.requestAnimationFrame(step);
        });
    }
    /**
     * Stops execution.
     */
    stop(): void {
        this._running = false;
    }

    /**
     * Delays execution of the code by some time.
     * @param time Time in milliseconds
     */
    delay(time: number): void {
        this._nextFrame = (new Date()).getTime() + time;
    }

    /**
     * Kills program immediately
     */
    panic(errCode): void {
        this.stop();
        var line = this.program.getLine();
        var short = i18n.t('runtime:errors.' + errCode + '.short');
        var long = i18n.t('runtime:errors.' + errCode + '.long');
        var atLine = i18n.t('runtime:errors.at.line', { line: line });
        this._editor.ace.gotoLine(line);
        alert(short + ' ' + atLine + '\n\n' + long);
        throw new Runtime.Panic();
    }
}

module Runtime {
    export class Panic {}
    export class End {}
    export class Restart {}
}

export = Runtime;

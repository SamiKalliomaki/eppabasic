import i18n = require('i18n');
import $ = require('jquery');
import Editor = require('editor/editor');
import ModuleLoader = require('./ModuleLoader');
import AsmjsTargetProgram = require('compiler/AsmjsTargetProgram');
import Module = require('./modules/Module');

/**
 * Handles everything related to runtime.
 */
class Runtime {
    /**
     * Editor object related which opened the runtime.
     */
    private _editor: Editor;
    /**
     * The program runtime runs.
     */
    private _program: AsmjsTargetProgram.AsmjsProgram;
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
     * Constructs a new runtime.
     */
    constructor() {
        // Initialize i18n
        i18n.init(
            {
                cookieName: 'lang',
                fallbackLng: 'en-US'
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

        this._initPromise = new Promise<void>((resolve: (value: void) => void, reject: (error: any) => void): void=> {
            moduleLoader.loaded((modules: Module.Constructor[]): void => {
                // Combine all defined functions in to one signature implementation map
                var functions = new Map<string, Function>();
                modules.forEach((module: Module.Constructor): void => {
                    // Construct module
                    module = new module(this);
                    // Get functions
                    module.getFunctions().forEach((func: Function, index: string): void => {
                        functions.set(index, func);
                    });
                });

                // Create program environment based on requested functions
                var environment = {};
                program.functions.forEach((signature: string, internalName: string): void => {
                    environment[internalName] = functions.get(signature);
                });
            });
        });
    }
    /**
     * Starts runtime as soon as it is loaded
     */
    start() {
        this._initPromise.then(() => {
            // Program is created
            // TODO: Start runtime
        });
    }
}

export = Runtime;
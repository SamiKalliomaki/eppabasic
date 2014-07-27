/// <reference path="math.js" />
/// <reference path="memory.js" />
/// <reference path="input.js" />
/// <reference path="graphicstext.js" />
/// <reference path="graphics2d.js" />

function Runtime() {
    var codeElem = document.getElementById('code');
    this.canvasHolder = document.getElementById('canvasHolder');
    // Test if opened as standalone
    if (!window.opener) {
        return error('Runtime has no owner! This page should only be loaded by using the compile&run button on the front page.');
    }
    // Get code from the editor
    var code = window.opener.ebeditor.compiled;
    if (!code)
        return error('Error while obtaining code from the editor');
    codeElem.innerHTML = code;

    // Initialize variables used by asm.js
    this.stdlib = {
        Math: Math,
        Uint8Array: Uint8Array,
        Int32Array: Int32Array,
        Uint32Array: Uint32Array,
        Float32Array: Float32Array,
        Float64Array: Float64Array
    };
    this.env = {};
    this.env.heapSize = 1024 * 1024;
    this.heap = new ArrayBuffer(this.env.heapSize);

    this.loadLibraries();
}

Runtime.prototype = {
    loadLibraries: function loadLibraries() {
        this.g2d = new Graphics2D(this.canvasHolder, this.heap);
        this.g2d.setSize(640, 480);
        this.g2d.ctx.strokeStyle = 'rgb(255, 255, 255)';
        this.g2d.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.g2d.clearColor = 'rgb(0, 0, 0)';
        this.g2d.env.clear();

        mixin(this.env, this.g2d.env);

        var gtext = new GraphicsText(this.canvasHolder, this.heap);
        mixin(this.env, gtext.env);

        var ebmath = new EbMath(this.heap);
        mixin(this.env, ebmath.env);

        var ebstring = new EbString(this.heap);
        mixin(this.env, ebstring.env);

        var input = new Input(this.heap, document.body);
        mixin(this.env, input.env);
    },

    init: function init() {
        this.program = Program(this.stdlib, this.env, this.heap);
        this.g2d.setProgram(this.program);
        this.program.init();
    },


    step: function step() {
        this.program.next();
    },
    run: function run() {
        if (!this.running)
            return;
        this.step();
        window.requestAnimationFrame(this.run.bind(this));
    },
    reset: function reset() {
        this.stop();
        this.program.reset();
    },
    start: function start() {
        this.running = true;
        this.run();
    },
    stop: function stop() {
        this.running = false;
    }
};

/*
 * Stops everything and shows an error message
 */
function error(msg) {
    // Clear the whole page
    var body = document.body;
    while (body.firstChild)
        body.removeChild(body.firstChild);

    // Add an box for errosrs
    var errBox = document.createElement('div');
    errBox.id = 'error';
    errBox.innerHTML = msg;
    body.appendChild(errBox);
}

/*
 * Combines two objects
 */
function mixin(a, b) {
    for (c in b) {
        a[c] = b[c];
    }
}

window.addEventListener('load', function init() {
    window.ebruntime = new Runtime();
    if (window.opener)
        window.opener.ebeditor.runtimeReady();
}, false);
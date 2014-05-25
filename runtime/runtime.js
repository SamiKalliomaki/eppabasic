/// <reference path="math.js" />
/// <reference path="memory.js" />
/// <reference path="graphics2d.js" />

function initialize() {
    // Get hooks to neccessary elements
    var codeElem = document.getElementById('code');
    var canvasHolder = document.getElementById('canvasHolder');

    // Test if opened as standalone
    if (!window.opener) {
        return error('Runtime has no owner! This page should only be loaded by using the compile&run button on the front page.');
    }

    // Get code from the owner
    var code = window.opener.ebcode;
    if (!code)
        return error('Error while obtaining code from the editor');
    codeElem.innerHTML = code;

    // Initialize functions
    var stdlib = {
        Math: Math,
        Int32Array: Int32Array,
        Uint32Array: Uint32Array,
        Float32Array: Float32Array,
        Float64Array: Float64Array
    };
    var env = {};
    var heap = new ArrayBuffer(1024 * 1024);

    var g2d = new Graphics2D(canvasHolder, heap);
    g2d.setSize(640, 480);
    mixin(env, g2d.env);
    mixin(stdlib, g2d.stdlib);
    var ebmath = new EbMath(heap);
    mixin(env, ebmath.env);
    mixin(stdlib, ebmath.stdlib);

    env.heapSize = 1024 * 1024;


    // Create program
    var program = Program(stdlib, env, heap);
    program.init();

    // Show some public functions to the editor
    var running = false;
    var canvas = this.canvas;
    function step() {
        program.next();
    }
    function run() {
        if (!running)
            return;
        step();
        window.requestAnimationFrame(run);
    }
    function reset() {
        canvas.width = canvas.width;
        stop();
        program.reset();
    }
    function start() {
        running = true;
        run();
    }
    function stop() {
        running = false;
    }

    window.ebstart = start;
    window.ebstop = stop;
    window.ebreset = reset;

    // Start the execution
    start();
}

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

//window.onload = initialize;
window.addEventListener('load', initialize, false);
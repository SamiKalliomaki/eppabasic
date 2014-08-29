define(['require', './graphics'], function (require) {
    "use strict";

    // Settings
    var settings = {
        heapSize: 16 * 1024 * 1024
    };

    var Graphics = require('./graphics');


    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
        this.mirror.on('start', this.start.bind(this));
    }

    Worker.prototype = {
        init: function init(code) {
            var Program = new Function('stdlib', 'env', 'heap', code);
            var external = this.createExternal();
            //console.log(code);
            this.program = Program(external.stdlib, external.env, external.heap);
            external.after();
            this.program.init();
        },

        start: function start() {
            // TODO Use window.postMessage for 0ms delay
            var last = (new Date()).getTime();
            function step() {
                var now = (new Date()).getTime();
                console.log(now - last);
                last = now;
                this.program.next();
                setTimeout(step.bind(this), 0);
            }
            setTimeout(step.bind(this), 0);
        },

        createExternal: function createExternal() {
            var stdlib = {
                Math: Math,
                Uint8Array: Uint8Array,
                Int32Array: Int32Array,
                Uint32Array: Uint32Array,
                Float32Array: Float32Array,
                Float64Array: Float64Array
            };

            var env = {};
            env.heapSize = settings.heapSize;
            env.panic = this.panic.bind(this);
            env.waitCond = function () { };
            env.integerToString = function (a) { };
            env.doubleToString = function (a) { };

            var heap = new ArrayBuffer(env.heapSize);

            var graphics = new Graphics(this.mirror);
            graphics.extendEnv(env);


            function after() {
                graphics.setProgram(this.program);
            }

            return {
                stdlib: stdlib,
                env: env,
                heap: heap,
                after: after.bind(this)
            };
        },

        panic: function panic() {
            this.mirror.send('panic');
        }
    };

    return Worker;
});
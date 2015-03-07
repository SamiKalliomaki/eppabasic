define(['require', './graphics', './math', './input', './time', './string', './messages', '../utils/string', './flowcontrol', '../utils/asmjsforie'], function (require) {
    "use strict";

    // Settings
    var settings = {
        heapSize: 16 * 1024 * 1024
    };

    var Graphics = require('./graphics');
    var Input = require('./input');
    var Time = require('./time');
    var StringUtils = require('../utils/string');
    var Messages = require('./messages');
    var FlowControl = require('./flowcontrol');
    var AsmjsForIE = require('../utils/asmjsforie');

    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
        this.mirror.on('start', this.start.bind(this));

        this.nextCall = 0;
        this.waitingResponse = false;
        this.running = false;
        this.paniced = false;
    }

    Worker.prototype = {
        init: function init(code) {
            if (!code)
                code = this.code;
            if (!code)
                throw new Error('No code specified for the worker');
            this.code = code;
            this.paniced = false;
            var Program = new Function('stdlib', 'env', 'heap', code);
            var external = this.createExternal();
            if (AsmjsForIE.needsConversion()) {
                code = AsmjsForIE.convert(code);
            }
            this.program = Program(external.stdlib, external.env, external.heap);
            external.after();
            this.program.init();

            this.stepTimeout = null;

            this.external = external;
        },

        start: function start() {
            var f = step.bind(this);
            function step() {
                if (this.waitingResponse) {
                    return;
                }

                var now = new Date().getTime();
                if (now >= this.nextCall && !this.program.next()) {
                    // Program ended
                    this.external.env.drawScreen();
                } else {
                    if (this.running) {
                        this.stepTimeout = setTimeout(f, Math.max(this.nextCall - now - 1, 0));
                    }
                }
            }

            this.running = true;
            this.stepTimeout = setTimeout(f, 0);
        },

        stop: function stop() {
            this.running = false;
        },

        setDelay: function setDelay(time) {
            this.nextCall = (new Date().getTime()) + time;
        },
        waitResponse: function waitResponse(callback) {
            var me = this;
            function onResponse() {
                callback.apply(null, arguments);
                me.mirror.off('response', onResponse);
                me.waitingResponse = false;
                me.start();
            }
            this.mirror.on('response', onResponse);
            this.waitingResponse = true;

            clearTimeout(this.stepTimeout);
            this.stepTimeout = null;
        },

        createExternal: function createExternal() {
            if (AsmjsForIE.needsConversion()) {
                var stdlib = {
                    Math: Math,
                    Uint8Array: AsmjsForIE.Uint8Array,
                    Int32Array: AsmjsForIE.Int32Array,
                    Uint32Array: AsmjsForIE.Uint32Array,
                    Float32Array: AsmjsForIE.Float32Array,
                    Float64Array: AsmjsForIE.Float64Array
                };
            } else {
                var stdlib = {
                    Math: Math,
                    Uint8Array: Uint8Array,
                    Int32Array: Int32Array,
                    Uint32Array: Uint32Array,
                    Float32Array: Float32Array,
                    Float64Array: Float64Array
                };
            }

            var env = {};
            env.heapSize = settings.heapSize;
            env.panic = this.panic.bind(this);

            if (AsmjsForIE.needsConversion()) {
                var heap = new AsmjsForIE.ArrayBuffer(env.heapSize);
            } else {
                var heap = new ArrayBuffer(env.heapSize);
            }
            var strutil = new StringUtils(heap);

            var graphics = new Graphics(this.mirror, strutil, this.setDelay.bind(this), this.waitResponse.bind(this));
            graphics.extendEnv(env);

            var math = new (require('./math'))(this.mirror);
            math.extendEnv(env);

            var input = new Input(this.mirror);
            input.extendEnv(env);

            var time = new Time(this.mirror, strutil, this.setDelay.bind(this));
            time.extendEnv(env);

            var string = new (require('./string'))(this.mirror, strutil);
            string.extendEnv(env);

            var messages = new Messages(this.mirror, strutil, this.waitResponse.bind(this));
            messages.extendEnv(env);

            var flowcontrol = new FlowControl(this.mirror, this.init.bind(this));
            flowcontrol.extendEnv(env);

            function after() {
                strutil.setProgram(this.program);
                graphics.setProgram(this.program);
                time.setProgram(this.program);
                messages.setProgram(this.program);
            }

            return {
                stdlib: stdlib,
                env: env,
                heap: heap,
                after: after.bind(this)
            };
        },

        panic: function panic(errCode) {
            this.stop();
            if (!this.paniced)
                this.mirror.send('panic', errCode, this.program.getLine());
            this.paniced = true;
        }
    };

    return Worker;
});
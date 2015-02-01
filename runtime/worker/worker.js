define(['require', './graphics', './math', '../polyfill', './input', './time', './string', './messages', '../utils/string','./flowcontrol'], function (require) {
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

    function Worker(mirror) {
        this.mirror = mirror;

        this.mirror.on('init', this.init.bind(this));
        this.mirror.on('start', this.start.bind(this));

        this.nextCall = 0;
        this.waitingResponse = false;
    }

    Worker.prototype = {
        init: function init(code) {
            if (!code)
                code = this.code;
            if (!code)
                throw new Error('No code specified for the worker');
            this.code = code;
            var Program = new Function('stdlib', 'env', 'heap', code);
            var external = this.createExternal();
            this.program = Program(external.stdlib, external.env, external.heap);
            external.after();
            this.program.init();

            this.external = external;
        },

        start: function start() {
            var lastStep = 0;
            var f = step.bind(this);
            function step() {
                if (this.waitingResponse) {
                    setTimeout(f, 1000 / 60);
                    return;
                }

                var now = new Date().getTime();
                if (now >= this.nextCall && !this.program.next()) {
                    // Program ended
                    this.external.env.drawScreen();
                } else {
                    setTimeout(f, Math.max(this.nextCall - now - 1, 0));
                }
            }
            setTimeout(f, 0);
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
            }
            this.mirror.on('response', onResponse);
            this.waitingResponse = true;
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

            var heap = new ArrayBuffer(env.heapSize);
            var strutil = new StringUtils(heap);

            var graphics = new Graphics(this.mirror, strutil, this.setDelay.bind(this));
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

        panic: function panic() {
            this.mirror.send('panic');
        }
    };

    return Worker;
});
define(['require', 'libs/random'], function (require) {
    "use strict";

    var Random = require('libs/random');

    function Math(mirror) {
        this.mirror = mirror;

        this.mt = Random.engines.mt19937().autoSeed();
    }

    Math.prototype = {
        env: {
            randInt: function randInt(a, b) {
                return Random.integer(a, b)(this.mt);
            },
            randDbl: function randDbl() {
                return Random.real(0, 1, false)(this.mt);
            },
            randomize: function randomize(a) {
                this.mt = Random.engines.mt19937().seed(a);
            },
            round: function round(a) {
                return Math.round(a);
            },
            round2: function round2(a, b) {
                var p = Math.pow(10, b);
                return Math.round(a * p) / p;
            }
        },
        extendEnv: function extendEnv(env) {
            for (var func in this.env) {
                if (this.env.hasOwnProperty(func)) {
                    if (env.hasOwnProperty(func))
                        throw new Error('Duplicate property of \'' + func + '\' in program env');
                    env[func] = this.env[func].bind(this);
                }
            }
        }
    };

    return Math;
});
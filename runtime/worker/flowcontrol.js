define(['require'], function (require) {
    "use strict";

    function FlowControl(mirror,init) {
        this.mirror = mirror;
        this.init = init;
    }

    FlowControl.prototype = {
        env: {
            end: function end() {
                this.mirror.send('end');
            },
            restart: function restart() {
                this.mirror.send('restart');
                this.init();
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

    return FlowControl;
});
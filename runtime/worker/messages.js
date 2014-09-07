define(['require', ], function (require) {
    "use strict";

    function Messages(mirror, strutil, waitResponse) {
        this.mirror = mirror;
        this.strutil = strutil;
        this.waitResponse = waitResponse;
    }

    Messages.prototype = {
        setProgram: function setProgram(program) {
            this.program = program;
        },

        env: {
            askNumber: function askNumber(str) {
                str = this.strutil.fromEppaBasic(str);
                this.mirror.send('askNumber', str);
                this.program.breakExec();
                this.waitResponse(function response(res) {
                    // Push the response to the stack
                    console.log(res);
                    this.program.setStackDbl(+res);
                }.bind(this));
            },
            askText: function askText(str) {
                str = this.strutil.fromEppaBasic(str);
                this.mirror.send('askText', str);
                this.program.breakExec();
                this.waitResponse(function response(res) {
                    // Push the response to the stack
                    this.program.setStackInt(this.strutil.toEppaBasic(res));
                }.bind(this));
            },

            message: function message(str) {
                str = this.strutil.fromEppaBasic(str);
                this.mirror.send('message', str);
                this.program.breakExec();
                this.waitResponse(function response(res) {
                    // Do nothing
                }.bind(this));
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

    return Messages;
});
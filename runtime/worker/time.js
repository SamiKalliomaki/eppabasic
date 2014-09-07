define(['require'], function (require) {
    "use strict";

    function Time(mirror, strutil) {
        this.mirror = mirror;
        this.strutil = strutil;
    }

    Time.prototype = {
        setProgram: function setProgram(program) {
            this.program = program;
        },

        env: {
            time: function time() {
                var date = new Date();
                var hours = date.getHours();
                var minutes = date.getMinutes();
                var seconds = date.getSeconds();
                if (minutes < 10)
                    minutes = '0' + minutes;
                if (seconds < 10)
                    seconds = '0' + seconds;
                return this.strutil.toEppaBasic(hours + ':' + minutes + ':' + seconds);
            },
            date: function date() {
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                return this.strutil.toEppaBasic(day + '.' + month + '.' + year);
            },
            year: function year() {
                return (new Date()).getFullYear();
            },
            month: function month() {
                return (new Date()).getMonth();
            },
            day: function day() {
                return (new Date()).getDate();
            },
            weekday: function weekday() {
                return (new Date()).getDay();
            },
            hour: function hour() {
                return (new Date()).getHours();
            },
            minute: function getMinute() {
                return (new Date()).getMinutes();
            },
            second: function second() {
                return (new Date()).getSeconds();
            },
            millisecond: function millisecond() {
                return (new Date()).getMilliseconds();
            },
            timer: function timer() {
                return (new Date()).getTime() / 1000;
            },
            wait: function wait(time) {
                var endTime = (new Date()).getTime() + time * 1000;
                this.setWaitCond(function waitCond() {
                    return (new Date()).getTime() >= endTime;
                })
                this.program.waitExec();
            },
            waitCond: function waitCond() {
                return this.waitCond();
            }
        },

        setWaitCond: function setWaitCond(cond) {
            this.waitCond = cond;
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

    return Time;
});
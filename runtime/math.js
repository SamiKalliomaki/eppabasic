function EbMath(heap) {
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
}

EbMath.prototype = {
    setProgram: function setProgram(program) {
        this.program = program;
    },

    env: {
        // Random functions
        randInt: function randInt(a, b) {
            return a + parseInt(Math.random() * (b - a + 1));
        },
        randDbl: function randDbl() {
            return Math.random();
        },
        
        round: function round(a) {
            return Math.round(a);
        },
        round2: function round2(a, b) {
            var p = Math.pow(10,b);
            return Math.round(a*p)/p;
        },
        
        // Time functions
        hours: function hours() {
            return new Date().getHours();
        },
        minutes: function minutes() {
            return new Date().getMinutes();
        },
        seconds: function seconds() {
            return new Date().getSeconds();
        },
        milliseconds: function milliseconds() {
            return new Date().getMilliseconds();
        },
        timer: function timer() {
            return new Date().getTime() / 1000;
        },
        wait: function wait(time) {
            var endTime = new Date().getTime() + time * 1000;
            this.setWaitCond(function () {
                return new Date().getTime() >= endTime;
            });
            this.program.waitExec();
        },
        waitCond: function waitCond() {
            return this.waitCond();
        }

    },

    setWaitCond: function setWaitCond(cond) {
        this.waitCond = cond;
    },

    stdlib: {},


};
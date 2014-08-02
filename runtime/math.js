function EbMath(heap, strUtil) {
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);

    this.strUtil = strUtil;
    
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
        
/*        compiler.defineJsFunction('env.year', true, 'Year', [], this.types.Integer);
        compiler.defineJsFunction('env.month', true, 'Month', [], this.types.Integer);
        compiler.defineJsFunction('env.day', true, 'Day', [], this.types.Integer);
        compiler.defineJsFunction('env.weekday', true, 'Weekday', [], this.types.Integer);
        compiler.defineJsFunction('env.hour', true, 'Hour', [], this.types.Integer);
        compiler.defineJsFunction('env.minute', true, 'Minute', [], this.types.Integer);
        compiler.defineJsFunction('env.second', true, 'Second', [], this.types.Integer);
        compiler.defineJsFunction('env.time', true, 'Time', [], this.types.String);
        compiler.defineJsFunction('env.date', true, 'Date', [], this.types.String);*/        
        
        
        // Time functions
        time: function time() {
            var x = new Date();
            var h = x.getHours();
            var m = x.getMinutes();
            if (m < 10) m = "0" + m;
            var s = x.getSeconds();
            if (s < 10) s = "0" + s;
            return this.strUtil.toEppaBasic(h + ":" + m + ":" + s);
        },
        date: function date() {
            var x = new Date();
            var y = x.getFullYear();
            var m = x.getMonth()+1;            
            var d = x.getDate();
            return this.strUtil.toEppaBasic(d + "." + m + "." + y);
        },
        year: function year() {
            return new Date().getFullYear();
        },
        month: function month() {
            return new Date().getMonth()+1;
        },
        day: function day() {
            return new Date().getDate();
        },
        weekday: function weekday() {
            var res = new Date().getDay();
            if (res == 0) res = 7;
            return res;
        },
        hour: function hour() {
            return new Date().getHours();
        },
        minute: function minute() {
            return new Date().getMinutes();
        },
        second: function second() {
            return new Date().getSeconds();
        },
        /*milliseconds: function milliseconds() {
            return new Date().getMilliseconds();
        },*/
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
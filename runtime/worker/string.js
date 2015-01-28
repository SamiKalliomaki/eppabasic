define(['require', 'xregexp', 'esrever'], function (require) {
    "use strict";

    var XRegExp = require('xregexp');
    var esrever = require('esrever');

    function EbString(mirror, strutil) {
        this.mirror = mirror;
        this.strutil = strutil;
    }

    EbString.prototype = {
        env: {
            chr: function chr(c) {
                return this.strutil.toEppaBasic(String.fromCodePoint(x));
            },

            instr: function instr(str1, str2) {
                str1 = this.strutil.fromEppaBasic(str1);
                str2 = this.strutil.fromEppaBasic(str2);
                return str1.indexOf(str2) + 1;
            },
            instr2: function instr2(x, str1, str2) {
                str1 = this.strutil.fromEppaBasic(str1);
                str2 = this.strutil.fromEppaBasic(str2);
                return str1.indexOf(str2, x - 1) + 1;
            },

            lcase: function lcase(str) {
                str = this.strutil.fromEppaBasic(str);
                return this.strutil.toEppaBasic(str.toLowerCase());
            },
            left: function left(str, x) {
                str = this.strutil.fromEppaBasic(str);
                x = Math.min(str.length, x);
                return this.strutil.toEppaBasic(str.substr(0, x));
            },
            len: function len(str) {
                str = this.strutil.fromEppaBasic(str);
                return str.length;
            },

            match: function match(str, regex) {
                str = this.strutil.fromEppaBasic(str);
                regex = this.strutil.fromEppaBasic(regex);
                regex = XRegExp('^' + regex + '$');
                return str.mathc(regex);
            },
            mid: function mid(str, a, b) {
                str = this.strutil.fromEppaBasic(str);
                if (typeof b === 'undefined')
                    b = str.length;
                return this.strutil.toEppaBasic(str.substr(a - 1, b));
            },

            repeat: function repeat(str, times) {
                str = this.strutil.fromEppaBasic(str);
                var buf = [];
                for (var i = 0; i < times; i++)
                    buf.push(str);
                return this.strutil.toEppaBasic(buf.join(''));
            },
            replace: function replace(str, from, to) {
                str = this.strutil.fromEppaBasic(str);
                from = this.strutil.fromEppaBasic(from);
                to = this.strutil.fromEppaBasic(to);
                var buf = [];
                while (true) {
                    var pos = str.indexOf(from);
                    if (pos === -1)
                        break;
                    buf.push(str.substr(0, pos));
                    buf.push(to);
                    str = str.substr(pos + to.length);
                }
                buf.push(str);
                return this.strutil.toEppaBasic(buf.join(''));
            },
            reverse: function reverse(str) {
                str = this.strutil.fromEppaBasic(str);
                return this.strutil.toEppaBasic(esrever.reverse(str));
            },
            right: function right(str, x) {
                str = this.strutil.fromEppaBasic(str);
                x = Math.min(str.length, x);
                return this.strutil.toEppaBasic(str.substr(str.length - x));
            },
            rot13: function rot13(str) {
                str = this.strutil.fromEppaBasic(str);
                str = str.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26); });
                return this.strutil.toEppaBasic(str);
            },

            trim: function trim(str) {
                str = this.strutil.fromEppaBasic(str);
                return this.strutil.toEppaBasic(str.trin());
            },

            ucase: function ucase(str) {
                str = this.strutil.fromEppaBasic(str);
                return this.strutil.toEppaBasic(esrever.toUpperCase());
            },

            val: function val(str) {
                return parseFloat(this.strutil.fromEppaBasic(str));
            },

            // Other functions
            integerToString: function integerToString(val) {
                return this.strutil.toEppaBasic('' + (val | 0));
            },
            doubleToString: function doubleToString(val) {
                var p = Math.pow(10, 8);
                val = Math.round(val * p) / p;
                return this.strutil.toEppaBasic('' + (+val));
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

    return EbString;
});
function EbString(heap, strUtil) {
    this.MEMU8 = new Uint8Array(heap);
    this.MEMS32 = new Int32Array(heap);
    this.MEMF32 = new Float32Array(heap);
    this.strUtil = strUtil;

    // Make all functions to use right this
    for (func in this.env) {
        if (this.env.hasOwnProperty(func))
            this.env[func] = this.env[func].bind(this);
    }
    
    this.strUtil = strUtil;
}

EbString.prototype = {
    env: {
        asc: function asc(str) {
            str = this.strUtil.fromEppaBasic(str);
            return str.charCodeAt(0);
        },
        chr: function chr(x) {
            return this.strUtil.toEppaBasic(String.fromCharCode(x));
        },
        left: function left(str, x) {
            str = this.strUtil.fromEppaBasic(str);
            x = Math.min(str.length, x);
            var newStr = str.substr(0, x);
            return this.strUtil.toEppaBasic(newStr);
        },
        instr: function instr(str1, str2) {
            str1 = this.strUtil.fromEppaBasic(str1);
            str2 = this.strUtil.fromEppaBasic(str2);
            var res = str1.indexOf(str2);
            return res+1;
        },
        instr2: function instr2(str1, str2, x) {
            str1 = this.strUtil.fromEppaBasic(str1);
            str2 = this.strUtil.fromEppaBasic(str2);
            var res = str1.indexOf(str2, x-1);
            return res+1;
        },
        lcase: function lcase(str) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = str.toLowerCase();
            return this.strUtil.toEppaBasic(newStr);
        },
        len: function len(str) {
            str = this.strUtil.fromEppaBasic(str);
            return str.length;
        },
        match: function match(str1, str2) {
            str1 = this.strUtil.fromEppaBasic(str1);
            str2 = "^" + this.strUtil.fromEppaBasic(str2) + "$";
            return str1.match(str2) != null;
        },
        mid: function mid(str, x) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = str.substr(x-1);
            return this.strUtil.toEppaBasic(newStr);
        },
        mid2: function mid2(str, x, y) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = str.substr(x-1, y);
            return this.strUtil.toEppaBasic(newStr);
        },
        repeat: function repeat(str, x) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = "";
            for (var i = 0; i < x; i++) newStr += str;
            return this.strUtil.toEppaBasic(newStr);
        },
        replace: function replace(str1, str2, str3) {
            str1 = this.strUtil.fromEppaBasic(str1);
            str2 = this.strUtil.fromEppaBasic(str2);
            str3 = this.strUtil.fromEppaBasic(str3);
            var newStr = "";
            var oldStr = str1;
            while (true) {
                var pos = oldStr.indexOf(str2);
                if (pos == -1) break;
                var x = oldStr.substr(0, pos+str2.length);
                var y = oldStr.substr(pos+str2.length);
                newStr += x.replace(str2, str3);
                oldStr = y;
            }
            newStr += oldStr;
            return this.strUtil.toEppaBasic(newStr);
        },
        reverse: function reverse(str) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = "";
            for (var i = 0; i < str.length; i++) {
                newStr = str.charAt(i) + newStr;
            }
            return this.strUtil.toEppaBasic(newStr);
        },
        right: function right(str, x) {
            str = this.strUtil.fromEppaBasic(str);
            x = Math.min(str.length, x);
            var newStr = str.substr(str.length-x);
            return this.strUtil.toEppaBasic(newStr);            
        },
        rot13: function rot13(str) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = "";
            for (var i = 0; i < str.length; i++) {
                var c = str.charAt(i);
                var x = str.charCodeAt(i);
                if (65 <= x && x <= 90) {
                    x = (x-65+13)%26+65;
                    c = String.fromCharCode(x);
                } else if (97 <= x && x <= 122) {
                    x = (x-97+13)%26+97;
                    c = String.fromCharCode(x);
                }
                newStr += c;
            }
            return this.strUtil.toEppaBasic(newStr);            
        },
        trim: function trim(str) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = str.trim();
            return this.strUtil.toEppaBasic(newStr);            
        },
        ucase: function ucase(str) {
            str = this.strUtil.fromEppaBasic(str);
            var newStr = str.toUpperCase();
            return this.strUtil.toEppaBasic(newStr);
        },
        integerToString: function integerToString(val) {
            return this.strUtil.toEppaBasic('' + (val | 0));
        },
        doubleToString: function doubleToString(val) {
            var p = Math.pow(10,8);
            val = Math.round(val*p)/p;
            return this.strUtil.toEppaBasic('' + (+val));
        },
        val: function val(x) {
            return parseFloat(this.strUtil.fromEppaBasic(x));
        },
    },

    stdlib: {}
};
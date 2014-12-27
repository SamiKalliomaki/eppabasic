if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

if (!Object.is) {
    Object.is = function (v1, v2) {
        if (v1 === 0 && v2 === 0) {
            return 1 / v1 === 1 / v2;
        }
        if (v1 !== v1) {
            return v2 !== v2;
        }
        return v1 === v2;
    };
}
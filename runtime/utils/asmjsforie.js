define(['require', 'libs/uglify'], function (require) {
    "use strict";

    var UglifyJS = require('libs/uglify');

    function needsConversion() {
        return !ArrayBuffer || !Uint8Array || !Int32Array || !Uint32Array || !Float32Array || !Float64Array;
    }

    function convert(code) {
        var ast = UglifyJS.parse(code, { bare_returns: true });

        // Transformers before method
        function before(node, descend) {
            // Assignment first
            if (node instanceof UglifyJS.AST_Assign && node.operator === '=' && node.left instanceof UglifyJS.AST_Sub) {
                // Transform to a setter call
                node = new UglifyJS.AST_Call({
                    expression: new UglifyJS.AST_Dot({
                        expression: node.left.expression,
                        property: 'set'
                    }),
                    args: [node.left.property, node.right]
                });

                // Decsend into the tree for nested array subscriptions
                node.transform(transformer);

                // Return the transformed tree
                return node;
            }
            if (node instanceof UglifyJS.AST_Sub) {
                node = new UglifyJS.AST_Call({
                    expression: new UglifyJS.AST_Dot({
                        expression: node.expression,
                        property: 'get'
                    }),
                    args: [node.property]
                });

                // Decsend into the tree for nested array subscriptions
                node.transform(transformer);

                // Return the transformed tree
                return node;
            }
        }

        // Do the transformation
        var transformer = new UglifyJS.TreeTransformer(before, null);
        ast = ast.transform(transformer);

        // Recreate the code
        return ast.print_to_string();
    }

    // Polyfill for TypedArray
    var TA = function () {
        function ToInt32(v) { return v >> 0; }
        function ToUint32(v) { return v >>> 0; }

        function ArrayBuffer(length) {
            length = ToInt32(length);
            Object.defineProperty(this, 'byteLength', { value: length });
            Object.defineProperty(this, '_bytes', { value: Array(length) });

            // Default to zero
            for (var i = 0; i < length; i++)
                this._bytes[i] = 0;
        }

        function TypedArray(buffer) {
            var length = buffer.length / this.BYTES_PER_ELEMENT;

            Object.defineProperty(this, 'buffer', { value: buffer });
            Object.defineProperty(this, 'length', { value: length });

        }

        Object.defineProperty(TypedArray.prototype, 'get', {
            value: function (index) {
                index = ToUint32(index);
                if (index >= this.length)
                    return undefined;
                var bytes = [];
                for (var i = 0; i < this.BYTES_PER_ELEMENT; i++) {
                    bytes.push(this.buffer._bytes[index * this.BYTES_PER_ELEMENT + i]);
                }
                return this._unpack(bytes);
            }
        });
        Object.defineProperty(TypedArray.prototype, 'set', {
            value: function (index, value) {
                index = ToUint32(index);
                if (index >= this.length)
                    return;
                var bytes = this._pack(value);
                for (var i = 0; i < this.BYTES_PER_ELEMENT; i++) {
                    this.buffer._bytes[index * this.BYTES_PER_ELEMENT + i] = bytes[i];
                }
            }
        });

        function makeTypedArray(elementSize, pack, unpack) {
            var TA = function () {
                TypedArray.apply(this, arguments);
            }

            Object.defineProperty(TA.prototype, 'constructor', { value: TypedArray });
            Object.defineProperty(TA.prototype, 'BYTES_PER_ELEMENT', { value: elementSize });
            Object.defineProperty(TA.prototype, '_pack', { value: pack });
            Object.defineProperty(TA.prototype, '_unpack', { value: unpack });

            return TA;
        }

        function as_signed(value, bits) { var s = 32 - bits; return (value << s) >> s; }
        function as_unsigned(value, bits) { var s = 32 - bits; return (value << s) >>> s; }

        function packI8(n) { return [n & 0xff]; }
        function unpackI8(bytes) { return as_signed(bytes[0], 8); }

        function packU8(n) { return [n & 0xff]; }
        function unpackU8(bytes) { return as_unsigned(bytes[0], 8); }

        function packU8Clamped(n) { n = round(Number(n)); return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff]; }

        function packI16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
        function unpackI16(bytes) { return as_signed(bytes[0] << 8 | bytes[1], 16); }

        function packU16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
        function unpackU16(bytes) { return as_unsigned(bytes[0] << 8 | bytes[1], 16); }

        function packI32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
        function unpackI32(bytes) { return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

        function packU32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
        function unpackU32(bytes) { return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }

        function packIEEE754(v, ebits, fbits) {

            var bias = (1 << (ebits - 1)) - 1,
                s, e, f, ln,
                i, bits, str, bytes;

            function roundToEven(n) {
                var w = floor(n), f = n - w;
                if (f < 0.5)
                    return w;
                if (f > 0.5)
                    return w + 1;
                return w % 2 ? w + 1 : w;
            }

            // Compute sign, exponent, fraction
            if (v !== v) {
                // NaN
                // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
                e = (1 << ebits) - 1; f = pow(2, fbits - 1); s = 0;
            } else if (v === Infinity || v === -Infinity) {
                e = (1 << ebits) - 1; f = 0; s = (v < 0) ? 1 : 0;
            } else if (v === 0) {
                e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
            } else {
                s = v < 0;
                v = abs(v);

                if (v >= pow(2, 1 - bias)) {
                    e = min(floor(log(v) / LN2), 1023);
                    f = roundToEven(v / pow(2, e) * pow(2, fbits));
                    if (f / pow(2, fbits) >= 2) {
                        e = e + 1;
                        f = 1;
                    }
                    if (e > bias) {
                        // Overflow
                        e = (1 << ebits) - 1;
                        f = 0;
                    } else {
                        // Normalized
                        e = e + bias;
                        f = f - pow(2, fbits);
                    }
                } else {
                    // Denormalized
                    e = 0;
                    f = roundToEven(v / pow(2, 1 - bias - fbits));
                }
            }

            // Pack sign, exponent, fraction
            bits = [];
            for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = floor(f / 2); }
            for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = floor(e / 2); }
            bits.push(s ? 1 : 0);
            bits.reverse();
            str = bits.join('');

            // Bits to bytes
            bytes = [];
            while (str.length) {
                bytes.push(parseInt(str.substring(0, 8), 2));
                str = str.substring(8);
            }
            return bytes;
        }

        function unpackIEEE754(bytes, ebits, fbits) {
            // Bytes to bits
            var bits = [], i, j, b, str,
                bias, s, e, f;

            for (i = bytes.length; i; i -= 1) {
                b = bytes[i - 1];
                for (j = 8; j; j -= 1) {
                    bits.push(b % 2 ? 1 : 0); b = b >> 1;
                }
            }
            bits.reverse();
            str = bits.join('');

            // Unpack sign, exponent, fraction
            bias = (1 << (ebits - 1)) - 1;
            s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
            e = parseInt(str.substring(1, 1 + ebits), 2);
            f = parseInt(str.substring(1 + ebits), 2);

            // Produce number
            if (e === (1 << ebits) - 1) {
                return f !== 0 ? NaN : s * Infinity;
            } else if (e > 0) {
                // Normalized
                return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
            } else if (f !== 0) {
                // Denormalized
                return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
            } else {
                return s < 0 ? -0 : 0;
            }
        }

        function unpackF64(b) { return unpackIEEE754(b, 11, 52); }
        function packF64(v) { return packIEEE754(v, 11, 52); }
        function unpackF32(b) { return unpackIEEE754(b, 8, 23); }
        function packF32(v) { return packIEEE754(v, 8, 23); }

        return {
            ArrayBuffer: ArrayBuffer,
            Int8Array: makeTypedArray(1, packI8, unpackI8),
            Uint8Array: makeTypedArray(1, packU8, unpackU8),
            Uint8ClampedArray: makeTypedArray(1, packU8Clamped, unpackU8),
            Int16Array: makeTypedArray(2, packI16, unpackI16),
            Uint16Array: makeTypedArray(2, packU16, unpackU16),
            Int32Array: makeTypedArray(4, packI32, unpackI32),
            Uint32Array: makeTypedArray(4, packU32, unpackU32),
            Float32Array: makeTypedArray(4, packF32, unpackF32),
            Float64Array: makeTypedArray(8, packF64, unpackF64)
        };
    }();

    return {
        needsConversion: needsConversion,
        convert: convert,

        ArrayBuffer: TA.ArrayBuffer,
        Int8Array: TA.Int8Array,
        Uint8Array: TA.Uint8Array,
        Uint8ClampedArray: TA.Uint8ClampedArray,
        Int16Array: TA.Int16Array,
        Uint16Array: TA.Uint16Array,
        Int32Array: TA.Uint32Array,
        Uint32Array: TA.Uint32Array,
        Float32Array: TA.Float32Array,
        Float64Array: TA.Float64Array
    }
});
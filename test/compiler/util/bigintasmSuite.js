define(['require', 'text!compiler/util/static/bigint.asm.js', 'text!compiler/util/static/heap.asm.js'], function (require) {
    var BigIntAsm = new Function('stdlib', 'env', 'heap',
        '"use asm";' +
        'var HEAP16U=new stdlib.Uint16Array(heap);' +
        'var HEAP32U=new stdlib.Uint32Array(heap);' +
        'var imul=stdlib.Math.imul;' +
        'var NEXT_BLOCK=0;' +
        'var HEAP_END=0;' +
        require('text!compiler/util/static/heap.asm.js') +
        require('text!compiler/util/static/bigint.asm.js') +
        'return{init:heapinit,alloc:alloc,add:intadd,sub:intsub,mul:intmul};'
        );

    if (!Math.imul) {
        Math.imul = function imul(a, b) {
            var ah = (a >>> 16) & 0xffff;
            var al = a & 0xffff;
            var bh = (b >>> 16) & 0xffff;
            var bl = b & 0xffff;
            // the shift by 0 fixes the sign on the high part
            // the final |0 converts the unsigned value into a signed value
            return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
        }
    }

    function createAsm() {
        var heap = new ArrayBuffer(1024 * 1024);
        var stdlib = {
            Uint16Array: Uint16Array,
            Uint32Array: Uint32Array,
            Math: Math
        };
        var HEAP32U = new Uint32Array(heap);
        var bi = new BigIntAsm(stdlib, null, heap);
        bi.init(heap.byteLength);

        // Some helper functions
        bi.pushInts = function (arr) {
            var ptr = bi.alloc(arr.length * 4);
            for (var i = 0; i < arr.length; i++) {
                HEAP32U[(ptr + 4 * i) >> 2] = arr[i];
            }
            return ptr;
        };
        bi.assertInts = function (ptr, arr, err, msg) {
            for (var i = 0; i < arr.length; i++) {
                if ((HEAP32U[(ptr + 4 * i) >> 2] | 0) != (arr[i] | 0)) {
                    function tohex(num) {
                        if (num < 0)
                            num = 0xffffffff + num + 1;
                        return ('00000000' + num.toString(16).toUpperCase()).substr(-8);
                    }
                    var arr2 = [];
                    for (var j = 0; j < arr.length; j++) {
                        arr2.push(tohex(HEAP32U[(ptr + 4 * j) >> 2] | 0));
                        arr[j] = tohex(arr[j] | 0);
                    }
                    for (; j < arr.length + 4; j++)
                        arr2.push(tohex(HEAP32U[(ptr + 4 * j) >> 2] | 0));

                    throw new err('Expected\n[' + arr.join(', ') + '] but got\n[' + arr2.join(', ') + ']\nin test:\n' + msg);
                }
            }
        }

        return bi;
    }

    return {
        addZeroTest: function addZeroTest(assert) {
            var bi = createAsm();

            // One digit
            var nums = [
                0x00000000,
                0xffffffff,
                0x0f0f0f0f,
                0xf0f0f0f0,
                0x00000001,
                0xfd3a5815,
                0x31415926,
                0x13371337,
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000000]);
                var b = bi.pushInts([0x000000004, num]);
                var t = bi.add(a, b);
                bi.assertInts(t, [0x000000004, num], assert.Error, 'Add one long to zero');
                var t = bi.add(b, a);
                bi.assertInts(t, [0x000000004, num], assert.Error, 'Add zero to one long');
            });

            // Two digits
            var nums = [
                [0x00000000, 0x00000000],
                [0x00000000, 0x00000001],
                [0x00000000, 0x10000000],
                [0x00000000, 0xffffffff],
                [0x00000001, 0x00000000],
                [0x10000000, 0x00000000],
                [0xffffffff, 0xffffffff],
                [0xbca83d50, 0xfa393af9],
                [0x31415926, 0x53589793],
                [0xadfc3f57, 0xfc2a81b8],
                [0x13456789, 0x10111213],
                [0x31211101, 0x98765432],
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000000]);
                var b = bi.pushInts([0x000000008].concat(num));
                var t = bi.add(a, b);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Add two long to zero');
                var t = bi.add(b, a);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Add zero to two long');
            });
            nums.forEach(function (num) {
                // With ill-formed a
                var a = bi.pushInts([0x000000008, 0x00000000, 0x00000000]);
                var b = bi.pushInts([0x000000008].concat(num));
                var t = bi.add(a, b);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Add two long to ill-formed zero');
                var t = bi.add(b, a);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Add ill-formed zero to two long');
            });

            // Hope that bigger numbers work...
        },

        addCarryTest: function addCarryTest(assert) {
            var bi = createAsm();

            var data = [
                { a: [0x10000000], b: [0x10000000], r: [0x20000000] },
                { a: [0x80000000], b: [0x80000000], r: [0x00000000, 0x00000001] },
                { a: [0x80000001], b: [0x80000001], r: [0x00000002, 0x00000001] },
                { a: [0x80000000, 0xefffffff], b: [0x80000000], r: [0x00000000, 0xf0000000] },
            ];

            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([data.b.length * 4].concat(data.b));
                var t = bi.add(a, b);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Add carry test');
                var t = bi.add(b, a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Add carry test');
            });
        },

        subZeroTest: function subZeroTest(assert) {
            var bi = createAsm();

            // One digit
            var nums = [
                0x00000000,
                0xffffffff,
                0x0f0f0f0f,
                0xf0f0f0f0,
                0x00000001,
                0xfd3a5815,
                0x31415926,
                0x13371337,
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000000]);
                var b = bi.pushInts([0x000000004, num]);
                var t = bi.sub(b, a);
                bi.assertInts(t, [0x000000004, num], assert.Error, 'Substract zero from one long');
            });

            // Two digits
            var nums = [
                //[0x00000000, 0x00000000],
                [0x00000000, 0x00000001],
                [0x00000000, 0x10000000],
                [0x00000000, 0xffffffff],
                //[0x00000001, 0x00000000],
                //[0x10000000, 0x00000000],
                [0xffffffff, 0xffffffff],
                [0xbca83d50, 0xfa393af9],
                [0x31415926, 0x53589793],
                [0xadfc3f57, 0xfc2a81b8],
                [0x13456789, 0x10111213],
                [0x31211101, 0x98765432],
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000000]);
                var b = bi.pushInts([0x000000008].concat(num));
                var t = bi.sub(b, a);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Substract zero from two long');
            });
            nums.forEach(function (num) {
                // With ill-formed a
                var a = bi.pushInts([0x000000008, 0x00000000, 0x00000000]);
                var b = bi.pushInts([0x000000008].concat(num));
                var t = bi.sub(b, a);
                bi.assertInts(t, [0x000000008].concat(num), assert.Error, 'Sbustract ill-formed zero from two long');
            });

            // Hope that bigger numbers work...
        },

        subZeroNegTest: function subZeroNegTest(assert) {

            var bi = createAsm();

            var data = [
                { a: [0x00000000], r: [0x00000000] },
                { a: [0x00000001], r: [0xffffffff] },
                { a: [0xffffffff], r: [0x00000001] },
                { a: [0x0f0f0f0f], r: [0xf0f0f0f1] },
                { a: [0xf0f0f0f0], r: [0x0f0f0f10] },
                { a: [0xfd3a5815], r: [0x02c5a7eb] },
                { a: [0x31415926], r: [0xcebea6da] },
                { a: [0x13371337], r: [0xecc8ecc9] },

                { a: [0x00000000], r: [0x00000000] },
                { a: [0x00000000, 0x00000001], r: [0x00000000, 0xffffffff] },
                { a: [0x00000000, 0x10000000], r: [0x00000000, 0xf0000000] },
                { a: [0x00000000, 0xffffffff], r: [0x00000000, 0x00000001] },
                { a: [0x00000001, 0x00000000], r: [0xffffffff] },
                { a: [0x10000000, 0x00000000], r: [0xf0000000] },
                { a: [0xffffffff], r: [0x00000001] },
                { a: [0xffffffff, 0xfffffffe], r: [0x00000001, 0x00000001] },
                //{ a: [0xbca83d50, 0xfa393af9], r: [] },
                { a: [0x31415926, 0x53589793], r: [0xCEBEA6DA, 0xACA7686C] },
                //{ a: [0xadfc3f57, 0xfc2a81b8], r: [] },
                //{ a: [0x13456789, 0x10111213], r: [] },
                //{ a: [0x31211101, 0x98765432], r: [] },
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([0x000000004, 0x00000000]);
                var t = bi.sub(b, a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Substract number from zero to yield negative number');
            });
        },

        mulZeroTest: function mulZeroTest(assert) {
            var bi = createAsm();

            var nums = [
                [0x00000000, 0x00000000],
                [0x00000000, 0x00000001],
                [0x00000000, 0x10000000],
                [0x00000000, 0xffffffff],
                [0x00000001, 0x00000000],
                [0x10000000, 0x00000000],
                [0xffffffff, 0xffffffff],
                [0xbca83d50, 0xfa393af9],
                [0x31415926, 0x53589793],
                [0xadfc3f57, 0xfc2a81b8],
                [0x13456789, 0x10111213],
                [0x31211101, 0x98765432],
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000000]);
                var b = bi.pushInts([num.length * 4].concat(num));
                var t = bi.mul(a, b);
                bi.assertInts(t, [0x000000004, 0x00000000], assert.Error, 'Multiply zero by a number');
                var t = bi.mul(b, a);
                bi.assertInts(t, [0x000000004, 0x00000000], assert.Error, 'Multiply number by zero');
            });
        },

        mulOneTest: function mulOneTest(assert) {
            var bi = createAsm();

            var nums = [
                [0x00000000],
                [0x00000001],
                [0x00000000, 0x00000001],
                [0x00000000, 0x10000000],
                [0x00000000, 0xffffffff],
                [0x00000001],
                [0x10000000],
                [0xffffffff],
                [0xbca83d50, 0xfa393af9],
                [0x31415926, 0x53589793],
                [0xadfc3f57, 0xfc2a81b8],
                [0x13456789, 0x10111213],
                [0x31211101, 0x98765432],
            ];
            nums.forEach(function (num) {
                var a = bi.pushInts([0x000000004, 0x00000001]);
                var b = bi.pushInts([num.length * 4].concat(num));
                var t = bi.mul(a, b);
                bi.assertInts(t, [num.length * 4].concat(num), assert.Error, 'Multiply one by a number');
                var t = bi.mul(b, a);
                bi.assertInts(t, [num.length * 4].concat(num), assert.Error, 'Multiply number by one');
            });
        },

        mulCarryTest: function mulCarryTest(assert) {
            var bi = createAsm();

            var data = [
                // Multiply by 10
                { a: [0x10000000], b: [0x0000000A], r: [0xA0000000] },
                { a: [0x12345678], b: [0x0000000A], r: [0xB60B60B0] },
                { a: [0x80000000], b: [0x0000000A], r: [0x00000000, 0xFFFFFFFB] },
                { a: [0x98765432], b: [0x0000000A], r: [0xF49F49F4, 0xFFFFFFFB] },
                { a: [0x87654321, 0x13121110], b: [0x0000000A], r: [0x49F49F4A, 0xBEB4AAA5] },
            ];

            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([data.b.length * 4].concat(data.b));
                var t = bi.mul(a, b);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Mul carry test');
                var t = bi.mul(b, a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Mul carry test');
            });
        },
    };
});
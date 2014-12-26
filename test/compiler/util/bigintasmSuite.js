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
        'return{init:heapinit,alloc:alloc,add:intadd,sub:intsub,mul:intmul,div:intdiv,inc:intinc,dec:intdec};'
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

            var data = [
                // Special cases
                { a: [] },                              //  0
                { a: [0x00000001] },                    //  1
                { a: [0xffffffff] },                    // -1
                { a: [0x80000000, 0x00000000] },        //  2147483648
                { a: [0x80000000] },                    // -2147483648

                // Some random tests
                { a: [0x0f0f0f0f] },                    //  252645135
                { a: [0xf0f0f0f0] },                    // -252645136
                { a: [0xfd3a5815] },                    // -46508011
                { a: [0x31415926] },                    //  826366246
                { a: [0x13371337] },                    //  322376503
                { a: [0x00000000, 0x00000001] },        //  4294967296
                { a: [0x00000000, 0xffffffff] },        // -4294967296
                { a: [0x00000000, 0x10000000] },        // -9223372036854775808
                { a: [0xbca83d50, 0xfa393af9] },        // -416236646268650160
                { a: [0x31415926, 0x53589793] },        //  5358979331415926
                { a: [0xadfc3f57, 0xfc2a81b8] },        // -276265796936908969
                { a: [0x13456789, 0x10111213] },        //  1157726452347922313
                { a: [0x31211101, 0x98765432] },        // -7460683158143299327
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([0x00000000]);      // Zero
                var t = bi.add(a, b);
                bi.assertInts(t, [data.a.length * 4].concat(data.a), assert.Error, 'Add number to zero');
                var t = bi.add(b, a);
                bi.assertInts(t, [data.a.length * 4].concat(data.a), assert.Error, 'Add zero to number');
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
            var data = [
                // Special cases
                { a: [] },                              //  0
                { a: [0x00000001] },                    //  1
                { a: [0xffffffff] },                    // -1
                { a: [0x80000000, 0x00000000] },        //  2147483648
                { a: [0x80000000] },                    // -2147483648

                // Some random tests
                { a: [0x0f0f0f0f] },                    //  252645135
                { a: [0xf0f0f0f0] },                    // -252645136
                { a: [0xfd3a5815] },                    // -46508011
                { a: [0x31415926] },                    //  826366246
                { a: [0x13371337] },                    //  322376503

                { a: [0x00000000, 0x00000001] },        //  4294967296
                { a: [0x00000000, 0xffffffff] },        // -4294967296
                { a: [0x00000000, 0x10000000] },        // -9223372036854775808
                { a: [0xbca83d50, 0xfa393af9] },        // -416236646268650160
                { a: [0x31415926, 0x53589793] },        //  5358979331415926
                { a: [0xadfc3f57, 0xfc2a81b8] },        // -276265796936908969
                { a: [0x13456789, 0x10111213] },        //  1157726452347922313
                { a: [0x31211101, 0x98765432] },        // -7460683158143299327
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([0x00000000]);      // Zero
                var t = bi.sub(a, b);
                bi.assertInts(t, [data.a.length * 4].concat(data.a), assert.Error, 'Substract zero from number');
            });

            // Hope that bigger numbers work...
        },

        subZeroNegTest: function subZeroNegTest(assert) {

            var bi = createAsm();

            var data = [
                // Special cases
                { a: [], r: [] },                                               //  0
                { a: [0x00000001], r: [0xffffffff] },                           //  1
                { a: [0xffffffff], r: [0x00000001] },                           // -1
                { a: [0x80000000, 0x00000000], r: [0x80000000] },               //  2147483648
                { a: [0x80000000], r: [0x80000000, 0x00000000] },               // -2147483648

                // Some random numbers
                { a: [0x0f0f0f0f], r: [0xf0f0f0f1] },                           //  252645135
                { a: [0xf0f0f0f0], r: [0x0f0f0f10] },                           // -252645136
                { a: [0xfd3a5815], r: [0x02c5a7eb] },                           // -46508011
                { a: [0x31415926], r: [0xcebea6da] },                           //  826366246
                { a: [0x13371337], r: [0xecc8ecc9] },                           //  322376503
                { a: [0x00000000, 0x00000001], r: [0x00000000, 0xffffffff] },   //  4294967296
                { a: [0x00000000, 0xffffffff], r: [0x00000000, 0x00000001] },   // -4294967296
                { a: [0x00000000, 0x10000000], r: [0x00000000, 0xf0000000] },   // -9223372036854775808
                { a: [0x10000000], r: [0xf0000000] },                           //  268435456
                { a: [0xffffffff], r: [0x00000001] },                           //  8589934591
                { a: [0xffffffff, 0xfffffffe], r: [0x00000001, 0x00000001] },   // -4294967297
                { a: [0x31415926, 0x53589793], r: [0xCEBEA6DA, 0xACA7686C] },   //  5358979331415926

            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([0x000000000]);
                var t = bi.sub(b, a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Substract number from zero to yield negative number');
            });
        },

        mulZeroTest: function mulZeroTest(assert) {
            var bi = createAsm();

            var data = [
                // Special cases
                { a: [] },                              //  0
                { a: [0x00000001] },                    //  1
                { a: [0xffffffff] },                    // -1
                { a: [0x80000000, 0x00000000] },        //  2147483648
                { a: [0x80000000] },                    // -2147483648

                // Some random tests
                { a: [0x0f0f0f0f] },                    //  252645135
                { a: [0xf0f0f0f0] },                    // -252645136
                { a: [0xfd3a5815] },                    // -46508011
                { a: [0x31415926] },                    //  826366246
                { a: [0x13371337] },                    //  322376503
                { a: [0x00000000, 0x00000001] },        //  4294967296
                { a: [0x00000000, 0xffffffff] },        // -4294967296
                { a: [0x00000000, 0x10000000] },        // -9223372036854775808
                { a: [0xbca83d50, 0xfa393af9] },        // -416236646268650160
                { a: [0x31415926, 0x53589793] },        //  5358979331415926
                { a: [0xadfc3f57, 0xfc2a81b8] },        // -276265796936908969
                { a: [0x13456789, 0x10111213] },        //  1157726452347922313
                { a: [0x31211101, 0x98765432] },        // -7460683158143299327
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var b = bi.pushInts([0x00000000]);      // Zero
                var t = bi.mul(a, b);
                bi.assertInts(t, [0x00000000], assert.Error, 'Multiply number by zero');
                var t = bi.mul(b, a);
                bi.assertInts(t, [0x00000000], assert.Error, 'Multiply zero by number');
            });
        },

        mulOneTest: function mulOneTest(assert) {
            var bi = createAsm();

            var data = [
                // Special cases
                { a: [] },                              //  0
                { a: [0x00000001] },                    //  1
                { a: [0xffffffff] },                    // -1
                { a: [0x80000000, 0x00000000] },        //  2147483648
                { a: [0x80000000] },                    // -2147483648

                // Some random tests
                { a: [0x0f0f0f0f] },                    //  252645135
                { a: [0xf0f0f0f0] },                    // -252645136
                { a: [0xfd3a5815] },                    // -46508011
                { a: [0x31415926] },                    //  826366246
                { a: [0x13371337] },                    //  322376503
                { a: [0x00000000, 0x00000001] },        //  4294967296
                { a: [0x00000000, 0xffffffff] },        // -4294967296
                { a: [0x00000000, 0x10000000] },        // -9223372036854775808
                { a: [0xbca83d50, 0xfa393af9] },        // -416236646268650160
                { a: [0x31415926, 0x53589793] },        //  5358979331415926
                { a: [0xadfc3f57, 0xfc2a81b8] },        // -276265796936908969
                { a: [0x13456789, 0x10111213] },        //  1157726452347922313
                { a: [0x31211101, 0x98765432] },        // -7460683158143299327
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([0x000000004, 0x00000001]);
                var b = bi.pushInts([data.a.length * 4].concat(data.a));
                var t = bi.mul(a, b);
                bi.assertInts(t, [data.a.length * 4].concat(data.a), assert.Error, 'Multiply one by a number');
                var t = bi.mul(b, a);
                bi.assertInts(t, [data.a.length * 4].concat(data.a), assert.Error, 'Multiply number by one');
            });
        },

        mulCarryTest: function mulCarryTest(assert) {
            var bi = createAsm();

            var data = [
                // Multiply by 10
                { a: [0x10000000], b: [0x0000000A], r: [0xA0000000, 0x00000000] },
                { a: [0x12345678], b: [0x0000000A], r: [0xB60B60B0, 0x00000000] },
                { a: [0x80000000], b: [0x0000000A], r: [0x00000000, 0xFFFFFFFB] },
                { a: [0x98765432], b: [0x0000000A], r: [0xF49F49F4, 0xFFFFFFFB] },
                { a: [0x87654321, 0x13121110], b: [0x0000000A], r: [0x49F49F4A, 0xBEB4AAA5, 0x00000000] },
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

        incTest: function incTest(assert) {
            var bi = createAsm();

            var data = [
                // Special cases
                { a: [], r: [0x00000001] },                                     //  0
                { a: [0x00000001], r: [0x00000002] },                           //  1
                { a: [0xffffffff], r: [] },                                     // -1
                { a: [0x80000000, 0x00000000], r: [0x80000001, 0x00000000] },   //  2147483648
                { a: [0x80000000], r: [0x80000001] },                           // -2147483648
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var t = bi.inc(a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Increase number by one');
            });
        },

        decTest: function decTest(assert) {
            var bi = createAsm();

            var data = [
                // Special cases
                { a: [], r: [0xffffffff] },                                     //  0
                { a: [0x00000001], r: [] },                                     //  1
                { a: [0xffffffff], r: [0xfffffffe] },                           // -1
                { a: [0x80000000, 0x00000000], r: [0x7fffffff] },               //  2147483648
                { a: [0x80000000], r: [0x7fffffff, 0xffffffff] },               // -2147483648
            ];
            data.forEach(function (data) {
                var a = bi.pushInts([data.a.length * 4].concat(data.a));
                var t = bi.dec(a);
                bi.assertInts(t, [data.r.length * 4].concat(data.r), assert.Error, 'Decrease number by one');
            });
        }
    };
});
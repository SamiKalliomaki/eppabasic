define(['require', 'compiler/util/hashes'], function (require, hashes) {
    var Map = hashes.Map;

    return {
        getUndefinedTest: function getUndefinedTest(assert) {
            var map = new Map();

            assert.undefined(map.get('foo'), 'Value not defined should return undefined');
            assert.undefined(map.get('bar'), 'Value not defined should return undefined');
            assert.undefined(map.get({}), 'Value not defined should return undefined');
            assert.undefined(map.get(17), 'Value not defined should return undefined');
            assert.undefined(map.get(Math.PI), 'Value not defined should return undefined');
            assert.undefined(map.get(NaN), 'Value not defined should return undefined');
        },

        setgetStringKeyTest: function setgeStringKeyTest(assert) {
            var map = new Map();

            map.set('foo', 1);
            map.set('bar', 2);
            map.set('Hello', 'World');
            map.set('I', 'U');

            assert.equals(map.get('foo'), 1, 'Get should return the value inserted to the map');
            assert.equals(map.get('bar'), 2, 'Get should return the value inserted to the map');
            assert.equals(map.get('Hello'), 'World', 'Get should return the value inserted to the map');
            assert.equals(map.get('I'), 'U', 'Get should return the value inserted to the map');

            // Reset some of the values
            map.set('foo', 'bar');
            map.set('bar', 2);

            assert.equals(map.get('foo'), 'bar', 'Get should return the latest value inserted to the map');
            assert.equals(map.get('bar'), 2, 'Get should return the latest value inserted to the map');
            assert.equals(map.get('Hello'), 'World', 'Get should return the latest value inserted to the map');
            assert.equals(map.get('I'), 'U', 'Get should return the latest value inserted to the map');
        },

        setgetNumberKeyTest: function setgeStringKeyTest(assert) {
            var map = new Map();

            map.set(1, 1);
            map.set(2, 2);
            map.set(Math.PI, 3);
            map.set(Math.PI + 0.00000001, 4);
            map.set(Math.E, 5);
            // Some negative keys
            map.set(-1, 6);
            map.set(-2, 7);
            map.set(-Math.PI, 8);
            map.set(-Math.PI + 0.00000001, 9);
            map.set(-Math.E, 10);
            // And finally some no-numbers
            map.set(NaN, 11);
            map.set(Infinity, 12);
            map.set(-Infinity, 13);

            assert.equals(map.get(1), 1, 'Get should return the value inserted to the map');
            assert.equals(map.get(2), 2, 'Get should return the value inserted to the map');
            assert.equals(map.get(Math.PI), 3, 'Get should return the value inserted to the map');
            assert.equals(map.get(Math.PI + 0.00000001), 4, 'Get should return the value inserted to the map');
            assert.equals(map.get(Math.E), 5, 'Get should return the value inserted to the map');

            assert.equals(map.get(-1), 6, 'Get should return the value inserted to the map');
            assert.equals(map.get(-2), 7, 'Get should return the value inserted to the map');
            assert.equals(map.get(-Math.PI), 8, 'Get should return the value inserted to the map');
            assert.equals(map.get(-Math.PI + 0.00000001), 9, 'Get should return the value inserted to the map');
            assert.equals(map.get(-Math.E), 10, 'Get should return the value inserted to the map');

            assert.equals(map.get(NaN), 11, 'Get should return the value inserted to the map');
            assert.equals(map.get(Infinity), 12, 'Get should return the value inserted to the map');
            assert.equals(map.get(-Infinity), 13, 'Get should return the value inserted to the map');
        }
    };
});
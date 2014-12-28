/**
 * @module
 */
define([], function () {
    "use strict";

    /**
     * An interface for hashable objects
     * @class
     * @abstract
     * @memberOf module:compiler/util/hashes
     */
    var Hashable = function Hashable() {
    }
    Hashable.prototype = {
        /**
         * Computes an hash of the object
         * 
         * @returns {number} The hash of the object
         * 
         * @instance
         * @abstract
         * @memberOf module:compiler/util/hashes.Hashable
         */
        hash: function hash() {
            throw new Error('Must be implemented');
        },
        /**
         * Checks if two objects represent the same key.
         * Used in case of collisions
         * 
         * Note: Must be that a.equals(b) === b.equals(a)
         * 
         * @param {module:compiler/util/hashes.Hashable} other - The other object to compare to this
         * @returns {boolean} Boolean representing that the values are equal
         * 
         * @instance
         * @abstract
         * @memberOf module:compiler/util/hashes.Hashable
         */
        equals: function equals(other) {
            throw new Error('Must be implemented');
        }
    };

    /**
     * Computes a hash for an object
     * 
     * @param {module:compiler/util/hashes.Hashable|number|string|object} obj - Object for the hash is computed
     * @returns {number} The hash of obj
     * 
     * @private
     * @memberOf module:compiler/util/hashes
     */
    function hash(obj) {
        if (typeof obj === 'number')
            return (obj * 123456789) | 0;
        if (typeof obj === 'string') {
            // Strings are hashed using FNV-1a
            var h = 2166136261 | 0;
            for (var i = 0; i < obj.length; i++) {
                // Lower bits
                h = Math.imul(h ^ (obj[i] & 0xff), 16777619);
                // Upper bits
                h = Math.imul(h ^ (obj[i] >>> 8), 16777619);
            }
            return h;
        }
        if (obj instanceof Hashable)
            return obj.hash();

        // No hash function is defined
        // Let's compute a hash based on members of the object
        // TODO: Make sure this is safe!
        var h = 2166136261 | 0;
        for (var key in obj) {
            h = Math.imul(hash(obj[key]), 16777619);
        }
        return h;
    }

    /**
    * Checks if two objects are equal
    * 
    * @param {module:compiler/util/hashes.Hashable|object} a - The first object to be compared
    * @param {module:compiler/util/hashes.Hashable|object} b - The second object to be compared
    * @returns {boolean} Boolean representing that the values are equal
    * 
    * @private
    * @memberOf module:compiler/util/hashes
    */
    function equals(a, b) {
        if (a instanceof Hashable && b instanceof Hashable)
            return a.equals(b);
        return Object.is(a, b);
    }


    /**
    * Computes the positive modulo of two numbers
    * 
    * @param {number} a - The number which is divided
    * @param {number} b - The number by which is divided
    * @returns {number} The positive modulo of a/b
    * 
    * @private
    * @memberOf module:compiler/util/hashes
    */
    function posmod(a, b) {
        return ((a % b) + b) % b;
    }

    /**
     * A collection of key-value pairs
     * @class
     * @param {number} size=1024 - Size of the hash table
     * @memberOf module:compiler/util/hashes
     */
    var Map = function Map(size) {
        if (!size)
            size = 1024;

        /**
         * The hash table
         * @type MapEntry[]
         * @private
         */
        this.table = new Array(size);
    }

    Map.prototype = {
        /**
         * Sets an value for a spesific key
         * 
         * @param {module:compiler/util/hashes.Hashable|number|string|object} key - The key of key-value pair
         * @param {object} value - The value of key-value pair
         * 
         * @instance
         * @memberOf module:compiler/util/hashes.Map
         */
        set: function set(key, value) {
            // Compute the hash and the index
            var h = hash(key);
            var index = posmod(h, this.table.length);

            // Check that there exists a collision table
            if (!this.table[index])
                this.table[index] = [];

            // Find if the key already exists
            var entry = this.table[index].find(function (entry) {
                return equals(key, entry.k);
            });

            // If not, then create the entry
            if (!entry) {
                entry = {
                    k: key,
                    v: undefined
                };
                this.table[index].push(entry);
            }

            // Finally set the value
            entry.v = value;
        },


        /**
         * Gets the value spesified by key
         * 
         * @param {module:compiler/util/hashes.Hashable|number|string|object} key - The key of key-value pair
         * @return {object} The value spesified by key
         * 
         * @instance
         * @memberOf module:compiler/util/hashes.Map
         */
        get: function get(key) {
            // Compute the hash and the index
            var h = hash(key);
            var index = posmod(h, this.table.length);

            // Check that there exists a collision table
            if (!this.table[index])
                return undefined;

            // Find if the key already exists
            var entry = this.table[index].find(function (entry) {
                return equals(key, entry.k);
            });

            // If not, then nothing is found
            if (!entry)
                return undefined;

            // Return the found value
            return entry.v;
        }
    };

    /**
     * A collection of unique values
     * @class
     * @param {number} size=1024 - Size of the hash table
     * @memberOf module:compiler/util/hashes
     */
    var Set = function Set(size) {
        if (!size)
            size = 1024;

        /**
         * The hash table
         * @type object[]
         * @private
         */
        this.table = new Array(size);
    }

    Set.prototype = {
        /**
         * Inserts a value to the set
         * 
         * @param {object} value - The value to be inserted
         * 
         * @instance
         * @memberOf module:compiler/util/hashes.Set
         */
        insert: function insert(value) {
            // Compute the hash and the index
            var h = hash(value);
            var index = posmod(h, this.table.length);

            // Check that there exists a collision table
            if (!this.table[index])
                this.table[index] = [];

            // Find if the value already exists
            var entry = this.table[index].find(function (entry) {
                return equals(value, entry);
            });

            // If not, then add the value to the set
            if (!entry) {
                this.table[index].push(value);
            }
        },


        /**
         * Checks if the set has the specific value
         * 
         * @param {module:compiler/util/hashes.Hashable|number|string|object} value - The value to be checked
         * @return {boolean) Boolean representing if the set has the value
         * 
         * @instance
         * @memberOf module:compiler/util/hashes.Set
         */
        has: function has(value) {
            // Compute the hash and the index
            var h = hash(value);
            var index = posmod(h, this.table.length);

            // Check that there exists a collision table
            if (!this.table[index])
                return undefined;

            // Find if the value already exists
            var entry = this.table[index].find(function (entry) {
                return equals(value, entry);
            });

            // Return true if found
            return entry !== undefined;
        }
    };

    return {
        Hashable: Hashable,
        Map: Map
    };
});
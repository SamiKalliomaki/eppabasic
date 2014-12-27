/**
 * Module containing CompilationUnit class
 * @module
 */
define([], function () {
    /**
     * Contains source code, internal data structures and errors
     *
     * @class
     * @param {string} source - The source code of the program being compiled
     * @memberOf module:compiler/compilationUnit
     */
    function CompilationUnit(source) {
        /**
         * The program source code
         * @type {string}
         */
        this.source = source;

        /**
         * Errors that have ocurred during compilation process
         * @type {module:compiler/compilationError.CompilationError[]}
         */
        this.errors = [];
    }

    CompilationUnit.prototype = {
    };

    return {
        CompilationUnit: CompilationUnit
    };
});
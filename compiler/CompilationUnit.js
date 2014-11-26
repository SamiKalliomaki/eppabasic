/**
 * Module containing CompilationUnit class
 * @module compiler/compilationUnit
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
        this.source = source;
        this.errors = [];
    }

    CompilationUnit.prototype = {
    };

    return {
        CompilationUnit: CompilationUnit
    };
});
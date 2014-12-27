/**
 * @module
 */
define([], function() {
    "use strict";

    /**
     * Phase of compilation
     * @class
     * @memberOf module:compiler/compilationPhase
     */
    var CompilationPhase = function() {

    }

    CompilationPhase.prototype = {
        /**
         * Executes the compilation phase on the compiation unit
         * @instance
         * @abstract
         * @param {module:compiler/compilationUnit.CompilationUnit} cu Compilation unit to run the phase on
         * @memberOf module:compiler/compilationPhase.CompilationPhase
         */
        run: function run(cu) {
            throw new Error("Must be implemented");
        }
    }

    return {
        CompilationPhase: CompilationPhase
    };
});
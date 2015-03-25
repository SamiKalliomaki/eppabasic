/// <reference path="../../../lib/vendor" />

import Runtime = require('../Runtime');

/**
 * A collection of EppaBasic functions.
 */
interface Module {
    /**
     * Gets list of functions defined in this module;
     * @returns Map mapping function signatures to implementations.
     */
    getFunctions(): Map<string, Function>;
}
module Module {
    /**
     * Constructor version of module.
     */
    export interface Constructor extends Module {
        /**
         * Constructs a new instance of this module.
         */
        new (runtime: Runtime);
    }
}

export = Module;
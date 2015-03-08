import util = require('./util');

/**
 * A collection of EppaBasic functions.
 */
interface Module {
    /**
     * Gets list of functions defined in this module;
     * @returns Functions defined in this module.
     */
    getFunctions(): util.EBFunction[];
}

export = Module;
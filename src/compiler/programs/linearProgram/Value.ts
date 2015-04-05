import Type = require('./Type');

/**
 * Either register or constant value in LinearProgram.
 */
class Value {
    /**
     * Type of the value.
     */
    private _type: Type;
}

module Value {
    /**
     * Value in a register in LinearProgram.
     */
    class Register extends Value {
        /**
         * Name of the register.
         */
        private _name: string;

        /**
         * Converts the register to a string for debug purposes.
         */
        toString(): string {
            return this._name;
        }
    }

    /**
     * Constant value in LinearProgram.
     */
    class Constant extends Value {

    }
}

export = Value;

import Type = require('./Type');

/**
 * Either register or constant value in LinearProgram.
 */
class Value {
    /**
     * Type of the value.
     */
    private _type: Type;

    /**
     * Type of the value.
     */
    get type(): Type {
        return this._type;
    }
}

module Value {
    /**
     * Value in a register in LinearProgram.
     */
    export class Register extends Value {
        /**
         * Name of the register.
         */
        private _name: string;
        /**
         * Name of the register.
         */
        get name(): string {
            return this._name;
        }

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
    export class Constant extends Value {

    }
    /**
     * Argument of a LinearFunction.
     */
    export class Argument extends Value {
        /**
         * Name of the argument.
         */
        private _name: string;
        /**
         * Name of the argument.
         */
        get name(): string {
            return this._name;
        }

        /**
         * Converts the argument to a string for debug purposes.
         */
        toString(): string {
            return this.type.toString() + ' ' + this.name;
        }
    }
}

export = Value;

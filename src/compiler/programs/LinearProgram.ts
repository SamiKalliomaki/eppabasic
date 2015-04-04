import Program = require('./Program');
import LinearFunction = require('./linearProgram/LinearFunction');

/**
 * Linear representation of the program.
 */
class LinearProgram implements Program {
    /**
     * Functions in the program.
     */
    private _functions: Set<LinearFunction>;

    /**
     * Converts the program to a string for debug purposes.
     */
    toString(): string {
        var buf: Array<string> = [];

        this._functions.forEach((func: LinearFunction) => {
            buf.push(func.toString());
        })

        return buf.join('\n');
    }
}

export = LinearProgram;

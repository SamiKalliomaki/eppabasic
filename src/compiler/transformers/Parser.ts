import Transformer = require('./transformer');
import Program = require("../programs/Program");
import TokenProgram = require("../programs/TokenProgram");


/**
 * Transformer that transforms TokenProgram to SyntaxTreeProgram
 */
class Parser implements Transformer {
    /**
     * Tranforms TokenProgram to SyntaxTreeProgram
     *
     * Transformer must check its source type is acceptable. If not, promise must be rejected.
     *
     * @param source TokenProgram to be transformed
     * @param preserve Whether the transofmer must preserve the source. Useful for optimizers. Defaults to false.
     *
     * @returns Promise of transformed program.
     */
    transform(source: Program, preserve?: boolean): Promise<Program> {
        return new Promise<Program>((resolve: (program: Program) => void, reject: (error: any) => void) => {
            var tokens = (<TokenProgram> source);
        });
    }
}

module Parser {
    export class ParseError implements Error {
        name: string = 'ParseError';
        message: string;

        constructor(_message: string) {
            this.message = _message;
        }
    }
}

export = Parser;

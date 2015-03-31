
/**
 * Represents error in parsing process.
 */
class ParseError implements Error {
    /**
     * Name of the error.
     */
    public name = 'ParseError';
    /**
     * Error message.
     */
    public message: string;

    /**
     * Constructs a new ParseError.
     *
     * @param message Message of this error.
     */
    constructor(message?: string) {
        this.message = message;
    }
}

export = ParseError;

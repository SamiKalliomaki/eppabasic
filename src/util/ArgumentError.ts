
/**
 * Represents error in function or constructor arguments.
 */
class ArgumentError implements Error {
    /**
     * Name of the error.
     */
    public name = 'ArgumentError';
    /**
     * Error message.
     */
    public message: string;

    /**
     * Constructs a new ArgumentError.
     *
     * @param message Message of this error.
     */
    constructor(message?: string) {
        this.message = message;
    }
}

export = ArgumentError;

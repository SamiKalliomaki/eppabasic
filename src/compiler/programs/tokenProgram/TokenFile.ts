import tokens = require('./tokens');

/**
 * Tokenized EppaBasic file.
 */
class TokenFile {
    /**
     * Token stream.
     */
    private _tokens: tokens.Token[];

    /**
     * Constructs a new tokenized source file.
     *
     * @param tokens Tokens in this file.
     */
    constructor(tokens: tokens.Token[]) {
        this._tokens = tokens;
    }
}

export = TokenFile;

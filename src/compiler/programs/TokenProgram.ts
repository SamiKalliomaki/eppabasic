import Program = require('./Program');
import TokenFile = require('./tokenProgram/TokenFile');
import ArgumentError = require('util/ArgumentError');

/**
 * Tokenized form of EppaBasic program.
 */
class TokenProgram {
    /**
     * Files in this program.
     */
    private _files: Set<TokenFile>;
    /**
     * Main file of the program. Must not be one in the _files.
     */
    private _mainFile: TokenFile;

    /**
     * Constructs a new TokenProgram.
     */
    constructor(files: Set<TokenFile>, mainFile: TokenFile) {
        if (files.has(mainFile))
            throw new ArgumentError('files must not contain mainFile');

        this._files = files;
        this._mainFile = mainFile;
    }

    /**
     * Files in this program.
     */
    get files(): Set<TokenFile> {
        return this._files;
    }
    /**
     * Main file of the program. Must be one in the files.
     */
    get mainFile(): TokenFile {
        return this._mainFile;
    }
}

export = TokenProgram;

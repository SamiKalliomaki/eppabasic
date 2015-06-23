import Program = require('./Program');
import Ast = require("./astProgram/Ast");
import ArgumentError = require('util/ArgumentError');

/**
 * Tokenized form of EppaBasic program.
 */
class AstProgram implements Program {
    /**
     * Files in this program.
     */
    private _files: Set<Ast>;
    /**
     * Main file of the program. Must be one in the _files.
     */
    private _mainFile: Ast;

    /**
     * Constructs a new TokenProgram.
     */
    constructor(files: Set<Ast>, mainFile: Ast) {
        if (files.has(mainFile))
            throw new ArgumentError('files must not contain mainFile');

        this._files = files;
        this._mainFile = mainFile;
    }

    /**
     * Files in this program.
     */
    get files(): Set<Ast> {
        return this._files;
    }
    /**
     * Main file of the program. Must be one in the files.
     */
    get mainFile(): Ast {
        return this._mainFile;
    }
}

export = AstProgram;

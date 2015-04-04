import Program = require('./Program');
import SyntaxTree = require("./syntaxTreeProgram/SyntaxTree");
import ArgumentError = require('util/ArgumentError');

/**
 * Tokenized form of EppaBasic program.
 */
class SyntaxTreeProgram implements Program {
    /**
     * Files in this program.
     */
    private _files: Set<SyntaxTree>;
    /**
     * Main file of the program. Must be one in the _files.
     */
    private _mainFile: SyntaxTree;

    /**
     * Constructs a new TokenProgram.
     */
    constructor(files: Set<SyntaxTree>, mainFile: SyntaxTree) {
        if (files.has(mainFile))
            throw new ArgumentError('files must not contain mainFile');

        this._files = files;
        this._mainFile = mainFile;
    }

    /**
     * Files in this program.
     */
    get files(): Set<SyntaxTree> {
        return this._files;
    }
    /**
     * Main file of the program. Must be one in the files.
     */
    get mainFile(): SyntaxTree {
        return this._mainFile;
    }
}

export = SyntaxTreeProgram;

import Program = require('./Program');
import SourceFile = require("./sourceProgram/SourceFile");
import ArgumentError = require('util/ArgumentError');

/**
 * Original source form of EppaBasic program.
 */
class SourceProgram implements Program {
    /**
     * Files in this program.
     */
    private _files: Set<SourceFile>;
    /**
     * Main file of the program. Must not be one in the _files.
     */
    private _mainFile: SourceFile;

    /**
     * Constructs a new SourceProgram.
     */
    constructor(files: Set<SourceFile>, mainFile: SourceFile) {
        if (files.has(mainFile))
            throw new ArgumentError('files must not contain mainFile');

        this._files = files;
        this._mainFile = mainFile;
    }

    /**
     * Files in this program.
     */
    get files(): Set<SourceFile> {
        return this._files;
    }
    /**
     * Main file of the program. Must be one in the files.
     */
    get mainFile(): SourceFile {
        return this._mainFile;
    }
}

export = SourceProgram;

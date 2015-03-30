
/**
 * Original EppaBasic source file.
 */
class SourceFile {
    /**
     * EppaBasic code in this file.
     */
    private _code: string;

    /**
     * Constructs a new SourceFile.
     *
     * @param code Code in this file.
     */
    constructor(code: string) {
        this._code = code;
    }
}

module SourceFile {
    /**
     * Position in a sourse file.
     */
    export class Position {}
}

export = SourceFile;

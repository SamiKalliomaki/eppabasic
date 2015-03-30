
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

    /**
     * EppaBasic code in this file.
     */
     get code(): string {
         return this._code;
     }
}

module SourceFile {
    /**
     * Position in a sourse file.
     */
    export class Position {
        /**
         * Line
         */
        private _line: number;
        /**
         * Column on the line
         */
        private _column: number;
        /**
         * Constructs a new position.
         *
         * @param line Line
         * @param column Column
         */
        constructor(line: number, column: number) {
            this._line = line;
            this._column = column;
        }

        /**
         * Line
         */
        get line(): number {
            return this._line;
        }
        /**
         * Column
         */
        get column(): number {
            return this.column;
        }
    }
}

export = SourceFile;

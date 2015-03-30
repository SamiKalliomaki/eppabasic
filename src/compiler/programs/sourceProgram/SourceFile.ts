
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
         * Offset in the file
         */
        private _offset: number;

        /**
         * Constructs a new position.
         *
         * @param line Line
         * @param column Column
         */
        constructor(line: number, column: number, offset: number) {
            this._line = line;
            this._column = column;
            this._offset = offset;
        }

        /**
         * Constructs a new Position based on this.
         *
         * @param amount How much to advance
         * @param resetLine Whether to advance line and reset column.
         *
         * @returns Advanced Position.
         */
        advance(amount: number, resetLine: boolean): SourceFile.Position {
            if (resetLine)
                return new SourceFile.Position(this.line + 1, 0, this.offset + amount);
            else
                return new SourceFile.Position(this.line, this.column + amount, this.offset + amount);
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
            return this._column;
        }
        /**
         * Offset in the file
         */
        get offset(): number {
            return this._offset;
        }
    }
}

export = SourceFile;

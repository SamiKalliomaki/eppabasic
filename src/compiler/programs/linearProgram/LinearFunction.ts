import BasicBlock = require('./BasicBlock');

class LinearFunction {
    /**
     * Name of the function.
     */
    private _name: string;
    /**
     * Basic blocks in the function.
     */
    private _blocks: Set<BasicBlock>
    /**
     * Entry for the function.
     */
    private _entry: BasicBlock.Prologue;

    /**
     * Converts the function to a string for debug purposes.
     */
    toString(): string {
        var buf: Array<string> = [];
        buf.push('define ' + this._name + ' {');
        buf.push(blockToString(this._entry));

        this._blocks.forEach((block: BasicBlock): void => {
            if (block === this._entry)
                return;     // Skip entry as this is already printed.
            buf.push(blockToString(block));
        });

        return buf.join('\t\n') + '}';

        /**
         * Converts a block to string usable in the function string.
         */
        function blockToString(block: BasicBlock): string {
            var str: string = block.toString();
            // Indent every line by one
            return '\t' + str.split('\n').join('\t\n');
        }
    }
}

export = LinearFunction;

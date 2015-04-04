import operations = require('./operations');

class BasicBlock {
    /**
     * Name of the block.
     */
    private _label: string;

    /**
     * Operations in this block.
     */
    private _operations: operations.Operation[];


    /**
     * Converts the block to a string for debug purposes.
     */
    toString(): string {
        var buf: Array<string> = [];
        buf.push(this._label + ':');

        this._operations.forEach((op: operations.Operation) => {
            buf.push(op.toString());
        })

        return buf.join('\t\n');
    }
}

module BasicBlock {
    export class Prologue extends BasicBlock {
        
    }
}

export = BasicBlock;

/// <reference path="../../../lib/vendor" />

import Transformer = require('./transformer');
import Program = require("../programs/Program");
import TokenProgram = require("../programs/TokenProgram");
import TokenFile = require("../programs/tokenProgram/TokenFile");
import SyntaxTreeProgram = require("../programs/SyntaxTreeProgram");
import SyntaxTree = require("../programs/syntaxTreeProgram/SyntaxTree");
import nodes = require("../programs/syntaxTreeProgram/nodes");

/**
 * Transformer that transforms TokenProgram to SyntaxTreeProgram
 */
class TokenToSyntaxTreeTransformer implements Transformer {
    /**
     * Parser used for transformation.
     */
    private _parser: Parser;

    /**
     * Constructs a new TokenToSyntaxTreeTransformer.
     */
    constructor() {
        this._parser = new Parser();
    }

    /**
     * Tranforms TokenProgram to SyntaxTreeProgram
     *
     * Transformer must check its source type is acceptable. If not, promise must be rejected.
     *
     * @param source TokenProgram to be transformed
     * @param preserve Whether the transofmer must preserve the source. Useful for optimizers. Defaults to false.
     *
     * @returns Promise of transformed program.
     */
    transform(source: TokenProgram, preserve?: boolean): Promise<Program> {
        return new Promise<Program>((resolve: (program: Program) => void, reject: (error: any) => void) => {
            var files = new Set<SyntaxTree>();
            var mainFile: SyntaxTree = this.transformFile(source.mainFile);

            source.files.forEach((file: TokenFile) => {
                files.add(this.transformFile(file));
            });

            resolve(new SyntaxTreeProgram(files, mainFile));
        });
    }

    /**
     * Does the transformation on a single file.
     *
     * @param sourceFile File to transform.
     * @return Transformed file.
     */
    private transformFile(sourceFile: TokenFile): SyntaxTree {
        return this._parser.parseFile(sourceFile);
    }
}


class Parser {
    /**
     * Parses a single files.
     *
     * @param tokenFile File to parse.
     * @returns Parsed syntax tree.
     */
    parseFile(tokenFile: TokenFile): SyntaxTree {
        var tokenQueue = tokenFile.tokens.slice(0);
        var root = new nodes.BaseLevelBlockNode();
        var tree = new SyntaxTree(root);
        var queue = [ root ];

        while(tokenQueue.length != 0) {
            var node = queue[0];

            var added = node.expand(tokenQueue);
            queue.shift();
            queue = added.concat(queue);
        }

        return tree;
    }
}

export = TokenToSyntaxTreeTransformer;

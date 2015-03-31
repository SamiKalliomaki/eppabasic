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
class Parser implements Transformer {
    private parseFile(tokenFile: TokenFile): SyntaxTree {
        var tokenQueue = tokenFile.tokens.slice(0);
        var root = new nodes.BaseLevelBlockNode();
        var tree = new SyntaxTree(root);
        var queue = [ root ];

        while(tokenQueue.length != 0) {
            var node = queue[0];

            queue = queue.concat(node.expand(tokenQueue));
            queue.shift();
        }

        return tree;
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
    transform(source: Program, preserve?: boolean): Promise<Program> {
        return new Promise<Program>((resolve: (program: Program) => void, reject: (error: any) => void) => {
            var tokenProgram = <TokenProgram> source;

            var mainFile: SyntaxTree;
            var files: Set<SyntaxTree>;

            tokenProgram.files.forEach((file: TokenFile) => {
                var syntaxTree = this.parseFile(file);
                files.add(syntaxTree);

                if(file == tokenProgram.mainFile){
                    mainFile = syntaxTree;
                }
            });

            resolve(new SyntaxTreeProgram(files, mainFile));
        });
    }
}

module Parser {
    export class ParseError implements Error {
        name: string = 'ParseError';
        message: string;

        constructor(_message: string) {
            this.message = _message;
        }
    }
}

export = Parser;

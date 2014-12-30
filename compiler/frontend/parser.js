/**
 * @module
 */
define(['require', 'compiler/compilationPhase', './parser/nodes'], function(require, compilationPhase, nodes) {
    /**
     * A hand-written top down parser for EppaBasic
     * @class
     * @extends {module:compiler/compilationPhase.CompilationPhase}
     * @memberOf module:compiler/frontend/parser
     */
    function Parser() {

    }

    Parser.prototype = Object.create(compilationPhase.CompilationPhase.prototype);
    Parser.prototype.constructor = Parser;

    /**
     * Runs parser on CompilationUnit. Results in cu.syntaxTreeRoot containing the root of the syntax tree.
     * @instance
     * @param {module:compiler/compilationUnit.CompilationUnit}
     * @memberOf module:compiler/frontend/parser.Parser
     */
    Parser.prototype.run = function run(cu) {
        var tokens = cu.tokens;

        cu.syntaxTreeRoot = new nodes.BaseLevelBlockNode();

        var predictionStack = [ cu.syntaxTreeRoot ];

        while (predictionStack.length > 0) {
            /*predictionStack.forEach(function (asd) {
                console.log('Stack: ' + asd.constructor.typeName);
            });
            this.printSyntaxTree(cu.syntaxTreeRoot);*/

            var node = predictionStack.shift();
            var newItems = node.doMove(cu.tokens);
            predictionStack = newItems.concat(predictionStack);
        }
    };
    
    Parser.prototype.printSyntaxTree = function printSyntaxTree(tree, level) {
        level = level | 0;
        
        var str = '';
        
        for (var i = 1; i < level; i++) {
            str += '| ';
        }
        
        if (level !== 0)
            str += '|-';

        console.log(str + tree.constructor.typeName);

        tree.childNodes.forEach(function (child) {
            this.printSyntaxTree(child, level + 1);
        }, this);
    }

    return {
        Parser: Parser
    }
});
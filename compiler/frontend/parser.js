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

        cu.syntaxTreeRoot = new nodes.ProgramNode();

        var predictionStack = [ cu.syntaxTreeRoot ];

        while(predictionStack.length > 0) {
            var newItems = predictionStack.shift().doMove();
            predictionStack = newItems.concat(predictionStack);
        }
    };

    return {
        Parser: Parser
    }
});
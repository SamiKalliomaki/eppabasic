/**
 * A collection of functions for handling CompilationUnit
 * @module compiler/toolchain
 */
define(['require', './frontend/lexer'], function (require, lexer) {
    "use strict";

    return {
        /**
         * Advances the lexer by one token and returns it.
         * @param {module:compiler/compilationUnit.CompilationUnit} cu - The compilation unit for which the frontend is run
         * @memberOf module:compiler/toolchain
         */
        runFrontend: function runFrontend(cu) {

        },

        /**
         * Creates a lexer with appropriate rules for EppaBasic
         * @param {module:compiler/compilationUnit.CompilationUnit} cu - The compilation unit for which the lexer is created
         * @returns {module:compiler/frontend/lexer.Lexer} The created lexer
         * @memberOf module:compiler/toolchain
         * @private
         */
        createLexer: function createLexer(cu) {
            var rules = [
                new lexer.Rule('^(\'[^\n]*)', lexer.tokens.CommentToken),
                new lexer.Rule('^(<>|<=?|>=?|=|\+|-|\*|\/|\\|\^|&|MOD\b|AND\b|OR\b|XOR\b|NOT\b)', lexer.tokens.OperatorToken),
                new lexer.Rule('^(\\d+(?:\\.\\d+)?)', lexer.tokens.NumberToken),
                new lexer.Rule('^"((?:""|[^"])*)"', lexer.tokens.StringToken),
                new lexer.Rule('^,', lexer.tokens.CommaToken),
                new lexer.Rule('^(\\(|\\))', lexer.tokens.ParenthesisToken),
            ];

            return new lexer.Lexer(cu, rules);
        }
    };
});
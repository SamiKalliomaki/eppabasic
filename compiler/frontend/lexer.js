/**
 * Lexer for EppaBasic
 * @module compiler/frontend/lexer
 */
define(['require', './lexer/tokens', './lexer/lexer', './lexer/rule'], function (require, Tokens, Lexer, Rule) {
    "use strict";

    return {
        Lexer: Lexer,
        Rule: Rule,
        tokens: Tokens
    };
});
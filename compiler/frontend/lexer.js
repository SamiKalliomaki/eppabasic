/**
 * Lexer for EppaBasic
 * @module compiler/frontend/lexer
 */
define(['require', './lexer/tokens', './lexer/lexer'], function (require, Tokens, Lexer) {
    "use strict";

    return {
        Lexer: Lexer,
        tokens: Tokens
    };
});
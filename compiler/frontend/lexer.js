/**
 * Lexer for EppaBasic
 * @module compiler/frontend/lexer
 */
define(['require', './lexer/tokens', './lexer/lexer', './lexer/rule'], function (require) {
    "use strict";

    var Tokens = require('./lexer/tokens');
    var Lexer = require('./lexer/lexer');
    var Rule = require('./lexer/rule');

    return {
        Lexer: Lexer,
        Rule: Rule,
        tokens: Tokens
    };
});
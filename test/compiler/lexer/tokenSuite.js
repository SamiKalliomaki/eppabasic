define(['require', 'compiler/frontend/lexer', 'compiler/compilationUnit'], function (require) {
    var Lexer = require('compiler/frontend/lexer').Lexer;
    var CompilationUnit = require('compiler/compilationUnit').CompilationUnit;
    var tokens = require('compiler/frontend/lexer').tokens;

    // Some helper functions for testing
    function createLexer() {
        return new Lexer([
            // TODO: Fill this area with tokens in order
        ]);
    }
    function testToken(tokenType, expectedStrings, unexpectedStrings, assert) {
        var lexer = createLexer();
        expectedStrings.forEach(function (string) {
            var cu = new CompilationUnit(string);
            lexer.run(cu);

            assert.arrayLength(cu.tokens, 1, 'Number of returned tokens should be 1. Test string: "' + string + '". Token type: ' + tokenType.constructor.name);
            assert.instanceof(cu.tokens[0], tokenType, 'Returned token type is wrong.');
        });

        unexpectedStrings.forEach(function (string) {
            var cu = new CompilationUnit(string);
            lexer.run(cu);

            if (lexer.tokens.length === 1 && cu.tokens[0] instanceof tokenType) {
                throw new assert.Error('Lexer should not return one token of type ' + tokenType.constructor.name + ' with input: "' + string + '"');
            }
        });
    }

    return {
        // --- Tests for every token type ---

    };
});
define(['require', 'compiler/frontend/lexer', 'compiler/compilationUnit'], function (require) {
    var Lexer = require('compiler/frontend/lexer').Lexer;
    var CompilationUnit = require('compiler/compilationUnit').CompilationUnit;
    var tokens = require('compiler/frontend/lexer').tokens;

    return {
        eosTest: function eosTest(assert) {
            var cu = new CompilationUnit('');
            var lexer = new Lexer([]);

            lexer.run(cu);

            assert.arrayLength(cu.tokens, 1, 'lexer ran with empty input should return exactly one token')
            assert.instanceof(cu.tokens[0], tokens.EOSToken, 'lexer ran with empty input should return EOSToken');
        }
    };
});
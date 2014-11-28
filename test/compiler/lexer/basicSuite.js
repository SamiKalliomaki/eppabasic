define(['require', 'compiler/frontend/lexer', 'compiler/compilationUnit'], function (require) {
    var Lexer = require('compiler/frontend/lexer').Lexer;
    var CompilationUnit = require('compiler/compilationUnit').CompilationUnit;
    var tokens = require('compiler/frontend/lexer').tokens;

    return {
        eosTest: function eosTest(assert) {
            var cu = new CompilationUnit('');
            var lexer = new Lexer(cu, []);
            assert.instanceof(lexer.advance(), tokens.EOSToken, 'lexer.advance with empty input should return EOSToken');
        }
    };
});
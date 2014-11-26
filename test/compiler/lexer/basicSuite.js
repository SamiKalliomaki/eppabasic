define(['require', 'compiler/frontend/lexer', 'compiler/compilationUnit'], function (require) {
    var Lexer = require('compiler/frontend/lexer').Lexer;
    var CompilationUnit = require('compiler/compilationUnit').CompilationUnit;
    var Tokens = require('compiler/frontend/lexer').Tokens;

    return {
        eosTest: function constructTest(assert) {
            var cu = new CompilationUnit('');
            var lexer = new Lexer(cu, []);
            assert.instanceof(lexer.advance(), Tokens.EOSToken, 'lexer.advance with empty input should return EOSToken');
        }
    };
});
define(['require', 'compiler/frontend/parser', 'compiler/frontend/lexer/tokens', 'compiler/compilationUnit'], function (require, parser, tokens, compilationUnit) {

    var Parser = parser.Parser;
    var CompilationUnit = compilationUnit.CompilationUnit;

    return {
        functionCallTest: function functionCallTest(assert) {
            var cu = new CompilationUnit('');
            
            var ctokens = [];
            ctokens.push(new tokens.IdentifierToken(1, ['Print']));
            ctokens.push(new tokens.LeftParenthesisToken(1, ['(']));
            ctokens.push(new tokens.StringToken(1, ['"Hello World"', 'Hello World']));
            ctokens.push(new tokens.RightParenthesisToken(1, [')']));
            cu.tokens = ctokens;

            var parser = new Parser();
            parser.run(cu);            
        }
    };
});
/// <reference path="../../../lib/jasmine" />
/// <reference path="../../../lib/vendor" />

import TokenRemoverTransformer = require('src/compiler/transformers/TokenRemoverTransformer');
import TokenProgram = require('src/compiler/programs/TokenProgram');
import TokenFile = require('src/compiler/programs/tokenProgram/TokenFile');
import tokens = require('src/compiler/programs/tokenProgram/tokens');
import SourceFile = require('src/compiler/programs/sourceProgram/SourceFile');

export class TokenRemoverTransformerSuite {
    NoTokenTypesToRemoveTest(done: () => void): void {
        var typesToRemove = new Set<typeof tokens.Token>();
        var transformer = new TokenRemoverTransformer(typesToRemove);

        var sourceTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];
        var expectedTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];

        var sourceProgram = tokensToProgram(sourceTokens);
        var expectedProgram = tokensToProgram(expectedTokens);

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }

    WrongTokenTypesToRemoveTest(done: () => void): void {
        var typesToRemove = new Set<typeof tokens.Token>();
        typesToRemove.add(tokens.CommentToken);
        var transformer = new TokenRemoverTransformer(typesToRemove);

        var sourceTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];
        var expectedTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];

        var sourceProgram = tokensToProgram(sourceTokens);
        var expectedProgram = tokensToProgram(expectedTokens);

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }

    OneTokenTypeToRemoveTest(done: () => void): void {
        var typesToRemove = new Set<typeof tokens.Token>();
        typesToRemove.add(tokens.EqualToken);
        var transformer = new TokenRemoverTransformer(typesToRemove);

        var sourceTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];
        var expectedTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];

        var sourceProgram = tokensToProgram(sourceTokens);
        var expectedProgram = tokensToProgram(expectedTokens);

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }

    TwoTokenTypesToRemoveTest(done: () => void): void {
        var typesToRemove = new Set<typeof tokens.Token>();
        typesToRemove.add(tokens.EqualToken);
        typesToRemove.add(tokens.IdentifierToken);
        var transformer = new TokenRemoverTransformer(typesToRemove);

        var sourceTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 3, 3), new SourceFile.Position(0, 5, 5)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.IdentifierToken(null, new SourceFile.Position(0, 8, 8), new SourceFile.Position(0, 15, 15)),
            new tokens.EqualToken(null, new SourceFile.Position(0, 15, 15), new SourceFile.Position(0, 17, 17)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];
        var expectedTokens = [
            new tokens.DimToken(null, new SourceFile.Position(0, 0, 0), new SourceFile.Position(0, 3, 3)),
            new tokens.AsToken(null, new SourceFile.Position(0, 5, 5), new SourceFile.Position(0, 8, 8)),
            new tokens.StringToken(null, new SourceFile.Position(0, 17, 17), new SourceFile.Position(0, 28, 28)),
            new tokens.EOSToken(null, new SourceFile.Position(0, 28, 28))
        ];

        var sourceProgram = tokensToProgram(sourceTokens);
        var expectedProgram = tokensToProgram(expectedTokens);

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }
}

function tokensToProgram(tokens: tokens.Token[]): TokenProgram {
    var file = new TokenFile(tokens);
    var files = new Set<TokenFile>();
    files.add(file);
    return new TokenProgram(files, file);
}

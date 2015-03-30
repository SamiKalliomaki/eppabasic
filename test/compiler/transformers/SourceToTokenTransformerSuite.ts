/// <reference path="../../../lib/jasmine" />
/// <reference path="../../../lib/vendor" />

import SourceToTokenTransformer = require('src/compiler/transformers/SourceToTokenTransformer');
import SourceProgram = require('src/compiler/programs/SourceProgram');
import SourceFile = require("../../../src/compiler/programs/sourceProgram/SourceFile");
import TokenProgram = require('src/compiler/programs/TokenProgram');
import TokenFile = require("../../../src/compiler/programs/tokenProgram/TokenFile");
import tokens = require("../../../src/compiler/programs/tokenProgram/tokens");

export class SourceToTokenTransformerSuite {
    VariableDeclarationTest(done: () => void): void {
        var code = 'Dim a As String = "A String"';
        var sourceFile = new SourceFile(code);
        var sourceFiles = new Set<SourceFile>();
        sourceFiles.add(sourceFile);
        var sourceProgram = new SourceProgram(sourceFiles, sourceFile);

        var expectedTokens = [
            new tokens.DimToken(sourceFile, new SourceFile.Position(0, 0), new SourceFile.Position(0, 3)),
            new tokens.IdentifierToken(sourceFile, new SourceFile.Position(0, 3), new SourceFile.Position(0, 5)),
            new tokens.AsToken(sourceFile, new SourceFile.Position(0, 5), new SourceFile.Position(0, 8)),
            new tokens.IdentifierToken(sourceFile, new SourceFile.Position(0, 8), new SourceFile.Position(0, 15)),
            new tokens.EqualToken(sourceFile, new SourceFile.Position(0, 15), new SourceFile.Position(0, 17)),
            new tokens.StringToken(sourceFile, new SourceFile.Position(0, 17), new SourceFile.Position(0, 28)),
            new tokens.EOSToken(sourceFile, new SourceFile.Position(0, 28))
        ];
        var tokenFile = new TokenFile(expectedTokens);
        var tokenFiles = new Set<TokenFile>();
        tokenFiles.add(tokenFile);
        var expectedProgram = new TokenProgram(tokenFiles, tokenFile);

        var transformer = new SourceToTokenTransformer(SourceToTokenTransformer.defaultTokenTypes());

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }

    EmptyStringTokenTest(done: () => void): void {
        var code = '""';
        var sourceFile = new SourceFile(code);
        var sourceFiles = new Set<SourceFile>();
        sourceFiles.add(sourceFile);
        var sourceProgram = new SourceProgram(sourceFiles, sourceFile);

        var expectedTokens = [
            new tokens.StringToken(sourceFile, new SourceFile.Position(0, 0), new SourceFile.Position(0, 2)),
            new tokens.EOSToken(sourceFile, new SourceFile.Position(0, 2))
        ];
        var tokenFile = new TokenFile(expectedTokens);
        var tokenFiles = new Set<TokenFile>();
        tokenFiles.add(tokenFile);
        var expectedProgram = new TokenProgram(tokenFiles, tokenFile);

        var transformer = new SourceToTokenTransformer(SourceToTokenTransformer.defaultTokenTypes());

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }

    HardStringTokenTest(done: () => void): void {
        var code = '"Somewhat ""difficult"" string to parse with double quotes at the end"""';
        var sourceFile = new SourceFile(code);
        var sourceFiles = new Set<SourceFile>();
        sourceFiles.add(sourceFile);
        var sourceProgram = new SourceProgram(sourceFiles, sourceFile);

        var expectedTokens = [
            new tokens.StringToken(sourceFile, new SourceFile.Position(0, 0), new SourceFile.Position(0, 72)),
            new tokens.EOSToken(sourceFile, new SourceFile.Position(0, 72))
        ];
        var tokenFile = new TokenFile(expectedTokens);
        var tokenFiles = new Set<TokenFile>();
        tokenFiles.add(tokenFile);
        var expectedProgram = new TokenProgram(tokenFiles, tokenFile);

        var transformer = new SourceToTokenTransformer(SourceToTokenTransformer.defaultTokenTypes());

        transformer.transform(sourceProgram).then((targetProgram: TokenProgram): void => {
            expect(targetProgram).toEqual(expectedProgram);

            done();
        });
    }
}

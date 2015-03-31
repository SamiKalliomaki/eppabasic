/// <reference path="../../../lib/jasmine" />

import TokenProgram = require('src/compiler/programs/TokenProgram');
import TokenFile = require('src/compiler/programs/tokenProgram/TokenFile');
import SourceFile = require('src/compiler/programs/sourceProgram/SourceFile');
import tokens = require('src/compiler/programs/tokenProgram/tokens');

export class TokenProgramSuite {
    MainfileMustBeInFilesTest(): void {
        var mainfileInFiles = (): void => {
            var sourceFile = new SourceFile('');
            var position = new SourceFile.Position(0, 0, 0);
            var mainFile = new TokenFile([new tokens.Token(sourceFile, position, position)]);
            var files = new Set<TokenFile>();
            files.add(mainFile);
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));

            var program = new TokenProgram(files, mainFile);
        };
        var mainfileNotInFiles = (): void => {
            var sourceFile = new SourceFile('');
            var position = new SourceFile.Position(0, 0, 0);
            var mainFile = new TokenFile([new tokens.Token(sourceFile, position, position)]);
            var files = new Set<TokenFile>();
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));
            files.add(new TokenFile([new tokens.Token(sourceFile, position, position)]));

            var program = new TokenProgram(files, mainFile);
        };

        expect(mainfileInFiles).not.toThrow();
        expect(mainfileNotInFiles).toThrow();
    }
}

/// <reference path="../../../lib/jasmine" />

import TokenProgram = require('src/compiler/programs/TokenProgram');
import TokenFile = require('src/compiler/programs/tokenProgram/TokenFile');
import tokens = require('src/compiler/programs/tokenProgram/tokens');

export class TokenProgramSuite {
    MainfileMustBeInFilesTest(): void {
        var mainfileInFiles = (): void => {
            var mainFile = new TokenFile([new tokens.Token()]);
            var files = new Set<TokenFile>();
            files.add(mainFile);
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));

            var program = new TokenProgram(files, mainFile);
        };
        var mainfileNotInFiles = (): void => {
            var mainFile = new TokenFile([new tokens.Token()]);
            var files = new Set<TokenFile>();
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));
            files.add(new TokenFile([new tokens.Token()]));

            var program = new TokenProgram(files, mainFile);
        };

        expect(mainfileInFiles).not.toThrow();
        expect(mainfileNotInFiles).toThrow();
    }
}

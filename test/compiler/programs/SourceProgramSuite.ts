/// <reference path="../../../lib/jasmine" />

import SourceProgram = require('src/compiler/programs/SourceProgram');
import SourceFile = require('src/compiler/programs/sourceProgram/SourceFile');

export class SourceProgramSuite {
    MainfileMustNotBeInFilesTest(): void {
        var mainfileInFiles = (): void => {
            var mainFile = new SourceFile('Main file code');
            var files = new Set<SourceFile>();
            files.add(mainFile);
            files.add(new SourceFile('File 1 code'));
            files.add(new SourceFile('File 2 code'));
            files.add(new SourceFile('File 3 code'));
            files.add(new SourceFile('File 4 code'));

            var program = new SourceProgram(files, mainFile);
        };
        var mainfileNotInFiles = (): void => {
            var mainFile = new SourceFile('Main file code');
            var files = new Set<SourceFile>();
            files.add(new SourceFile('File 1 code'));
            files.add(new SourceFile('File 2 code'));
            files.add(new SourceFile('File 3 code'));
            files.add(new SourceFile('File 4 code'));

            var program = new SourceProgram(files, mainFile);
        };

        expect(mainfileInFiles).toThrow();
        expect(mainfileNotInFiles).not.toThrow();
    }
}

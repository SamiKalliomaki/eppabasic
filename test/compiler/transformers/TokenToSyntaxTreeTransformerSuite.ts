/// <reference path="../../../lib/jasmine" />

import TokenProgram = require("src/compiler/programs/TokenProgram");
import TokenFile = require("src/compiler/programs/tokenProgram/TokenFile");
import tokens = require("src/compiler/programs/tokenProgram/tokens");
import SyntaxTreeProgram = require('src/compiler/programs/SyntaxTreeProgram');
import nodes = require('src/compiler/programs/syntaxTreeProgram/nodes');
import TokenToSyntaxTreeTranformer = require("../../../src/compiler/transformers/TokenToSyntaxTreeTransformer");

export class TokenToSyntaxTreeTransformerSuite {
    MustNotReturnNullsTest(done: () => void) {
        var mainFile = new TokenFile([]);
        var files = new Set<TokenFile>();
        files.add(new TokenFile([]));
        var tokenProgram = new TokenProgram(files, mainFile);

        var transformer = new TokenToSyntaxTreeTranformer();

        transformer.transform(tokenProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile).not.toBeNull();
            expect(program.files.size).toBe(files.size);
            program.files.forEach((file) => {
                expect(file).not.toBeNull();
            });
            done();
        });
    }

    TransformTest(done: () => void) {
        var mainFile = new TokenFile([
            new tokens.DimToken(),
            new tokens.IdentifierToken(),
            new tokens.EqualToken(),
            new tokens.NumberToken(),
            new tokens.EOSToken()
        ]);
        var files = new Set<TokenFile>();
        files.add(new TokenFile([]));
        var tokenProgram = new TokenProgram(files, mainFile);

        var transformer = new TokenToSyntaxTreeTranformer();

        transformer.transform(tokenProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile).not.toBeNull();
            expect(program.files.size).toBe(files.size);

            expect(program.mainFile.root.toString()).toEqual(
"BaseLevelBlockNode\n\
|-BlockNode\n\
| |-StatementNode\n\
| | |-VariableDefinitionNode\n\
| | | |-DimTokenNode\n\
| | | |-IdentifierTokenNode\n\
| | | |-VariableDefinitionEndingNode\n\
| | | | |-InitializerNode\n\
| | | | | |-EqualTokenNode\n\
| | | | | |-ExpressionNode\n\
| | | | | | |-Expression1Node\n\
| | | | | | | |-Expression2Node\n\
| | | | | | | | |-Expression3Node\n\
| | | | | | | | | |-Expression4Node\n\
| | | | | | | | | | |-Expression5Node\n\
| | | | | | | | | | | |-Expression6Node\n\
| | | | | | | | | | | | |-Expression7Node\n\
| | | | | | | | | | | | | |-ConstantNode\n\
| | | | | | | | | | | | | | |-NumberTokenNode\n\
| |-LineEndNode\n\
| | |-EOSTokenNode\n\
| |-BlockNode\n\
|-BaseLevelBlockNode"
            );

            done();
        });
    }
}

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
        }).catch((e) => { throw e; });
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
        }).catch((e) => { throw e; });
    }

    VariableAssignmentTest(done: () => void) {
        var variableAssignmentFile = new TokenFile([
            new tokens.IdentifierToken(),
            new tokens.LeftBracketToken(),
            new tokens.NumberToken(),
            new tokens.RightBracketToken(),
            new tokens.EqualToken(),
            new tokens.StringToken(),
            new tokens.EOSToken()
        ]);

        var variableAssignmentProgram = new TokenProgram(new Set<TokenFile>(), variableAssignmentFile);

        var transformer = new TokenToSyntaxTreeTranformer();
        transformer.transform(variableAssignmentProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile.root.toString()).toEqual(
"BaseLevelBlockNode\n\
|-BlockNode\n\
| |-StatementNode\n\
| | |-VariableAssignmentNode\n\
| | | |-VariableReferenceNode\n\
| | | | |-IdentifierTokenNode\n\
| | | | |-VariableReferenceContinuationNode\n\
| | | | | |-LeftBracketTokenNode\n\
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
| | | | | |-RightBracketTokenNode\n\
| | | | | |-VariableReferenceContinuationNode\n\
| | | |-EqualTokenNode\n\
| | | |-ExpressionNode\n\
| | | | |-Expression1Node\n\
| | | | | |-Expression2Node\n\
| | | | | | |-Expression3Node\n\
| | | | | | | |-Expression4Node\n\
| | | | | | | | |-Expression5Node\n\
| | | | | | | | | |-Expression6Node\n\
| | | | | | | | | | |-Expression7Node\n\
| | | | | | | | | | | |-ConstantNode\n\
| | | | | | | | | | | | |-StringTokenNode\n\
| |-LineEndNode\n\
| | |-EOSTokenNode\n\
| |-BlockNode\n\
|-BaseLevelBlockNode"
            );
            done();
        }).catch((e) => { throw e; });
    }

    FunctionCallTest(done: () => void) {
        var functionCallFile = new TokenFile([
            new tokens.IdentifierToken(),
            new tokens.LeftBracketToken(),
            new tokens.NumberToken(),
            new tokens.RightBracketToken(),
            new tokens.LeftParenthesisToken(),
            new tokens.StringToken(),
            new tokens.RightParenthesisToken(),
            new tokens.EOSToken()
        ]);

        var functionCallProgram = new TokenProgram(new Set<TokenFile>(), functionCallFile);

        var transformer = new TokenToSyntaxTreeTranformer();
        transformer.transform(functionCallProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile.root.toString()).toEqual(
"BaseLevelBlockNode\n\
|-BlockNode\n\
| |-StatementNode\n\
| | |-FunctionCallNode\n\
| | | |-VariableReferenceNode\n\
| | | | |-IdentifierTokenNode\n\
| | | | |-VariableReferenceContinuationNode\n\
| | | | | |-LeftBracketTokenNode\n\
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
| | | | | |-RightBracketTokenNode\n\
| | | | | |-VariableReferenceContinuationNode\n\
| | | |-LeftParenthesisTokenNode\n\
| | | |-ParameterListNode\n\
| | | | |-ExpressionNode\n\
| | | | | |-Expression1Node\n\
| | | | | | |-Expression2Node\n\
| | | | | | | |-Expression3Node\n\
| | | | | | | | |-Expression4Node\n\
| | | | | | | | | |-Expression5Node\n\
| | | | | | | | | | |-Expression6Node\n\
| | | | | | | | | | | |-Expression7Node\n\
| | | | | | | | | | | | |-ConstantNode\n\
| | | | | | | | | | | | | |-StringTokenNode\n\
| | | | |-ParameterListContinuationNode\n\
| | | |-RightParenthesisTokenNode\n\
| |-LineEndNode\n\
| | |-EOSTokenNode\n\
| |-BlockNode\n\
|-BaseLevelBlockNode"
            );
            done();
        }).catch((e) => { throw e; });
    }

    BaseLevelFunctionCallTest(done: () => void) {
        var baseLevelFunctionCallFile = new TokenFile([
            new tokens.IdentifierToken(),
            new tokens.LeftBracketToken(),
            new tokens.NumberToken(),
            new tokens.RightBracketToken(),
            new tokens.StringToken(),
            new tokens.EOSToken(),
        ]);

        var baseLevelFunctionCallProgram = new TokenProgram(new Set<TokenFile>(), baseLevelFunctionCallFile);

        var transformer = new TokenToSyntaxTreeTranformer();
        transformer.transform(baseLevelFunctionCallProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile.root.toString()).toEqual(
"BaseLevelBlockNode\n\
|-BlockNode\n\
| |-StatementNode\n\
| | |-BaseFunctionCallNode\n\
| | | |-VariableReferenceNode\n\
| | | | |-IdentifierTokenNode\n\
| | | | |-VariableReferenceContinuationNode\n\
| | | | | |-LeftBracketTokenNode\n\
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
| | | | | |-RightBracketTokenNode\n\
| | | | | |-VariableReferenceContinuationNode\n\
| | | |-ParameterListNode\n\
| | | | |-ExpressionNode\n\
| | | | | |-Expression1Node\n\
| | | | | | |-Expression2Node\n\
| | | | | | | |-Expression3Node\n\
| | | | | | | | |-Expression4Node\n\
| | | | | | | | | |-Expression5Node\n\
| | | | | | | | | | |-Expression6Node\n\
| | | | | | | | | | | |-Expression7Node\n\
| | | | | | | | | | | | |-ConstantNode\n\
| | | | | | | | | | | | | |-StringTokenNode\n\
| | | | |-ParameterListContinuationNode\n\
| |-LineEndNode\n\
| | |-EOSTokenNode\n\
| |-BlockNode\n\
|-BaseLevelBlockNode"
            );
            done();
        }).catch((e) => { throw e; });
    }

    ElementFromFunctionCallTest(done: () => void): void {
        // a = f()[0]
        var functionCallFile = new TokenFile([
            new tokens.IdentifierToken(),
            new tokens.EqualToken(),
            new tokens.IdentifierToken(),
            new tokens.LeftParenthesisToken(),
            new tokens.RightParenthesisToken(),
            new tokens.LeftBracketToken(),
            new tokens.NumberToken(),
            new tokens.RightBracketToken(),
            new tokens.EOSToken()
        ]);

        var functionCallProgram = new TokenProgram(new Set<TokenFile>(), functionCallFile);

        var transformer = new TokenToSyntaxTreeTranformer();
        transformer.transform(functionCallProgram).then((program: SyntaxTreeProgram) => {
            expect(program.mainFile.root.toString()).toEqual(
""
            );
            done();
        }).catch((e) => { console.error(e); });
    }
}

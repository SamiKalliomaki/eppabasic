import tokens = require('../tokenProgram/tokens');
import ParseError = require("util/ParseError");

/*
 * Syntax tree node
 */
export class Node {
    /*
     * List of token types that can start node of this type
     */
    static startTokens: Set<typeof tokens.Token>;
    static canBeEmpty: boolean = false;

    protected _children: Node[];

    constructor() {
        this._children = [];
    }

    /*
     * Expands node
     *
     * @param queue Current token queue
     *
     * @returns List of tokens to be added to the token queue
     */
    expand(queue: tokens.Token[]): Node[] {
        throw Error('Not implemented');
    }

    /*
     * Returns shortest sequence of tokens that fulfills this Node
     */
    static getShortest(): tokens.Token[] {
        throw Error('Not implemented');
    }
}

/*
 * Syntax tree node consisting of a single token
 */
export class TokenNode extends Node {
    private _token: tokens.Token;

    /*
     * Expands token node. Tries to consume token of node's type. If that fails, throws a ParseError.
     *
     * @param queue Current token queue
     *
     * @returns List of tokens to be added to the token queue
     */
    expand(queue: tokens.Token[]): Node[] {
        var tokenClass: typeof tokens.Token;

        (<typeof TokenNode> this.constructor).startTokens.forEach((_tokenClass) => {
            tokenClass = _tokenClass;
        });

        if(queue.length >= 1 && queue[0] instanceof tokenClass) {
            this._token = queue[0];
            queue.shift();
            return [];
        }

        throw new ParseError('Invalid token encountered');
    }
}

/*
 * BaseClass for Nodes that consists of sequence of other nodes.
 */
export class SequenceNode extends Node {
    /*
     * Possible sequences that this node can consist of
     */
    static sequences: (typeof Node)[][];
    /*
     * Checks if given sequence should be used. Necessary if two sequences can
     * begin with the same token.
     */
    static checkers: { [id: number]: ((queue: tokens.Token[]) => boolean) };

    /*
     * Expands sequence node. Returns first sequence token fits into.
     *
     * @param queue Current token queue
     *
     * @returns List of tokens to be added to the token queue
     */
    expand(queue: tokens.Token[]) {
        if(queue.length == 0 && (<typeof SequenceNode> this.constructor).canBeEmpty)
            return [];

        var Class = <typeof SequenceNode> this.constructor;

        var selectedSequence: (typeof Node)[];
        var i = 0;
        Class.sequences.forEach((sequence: (typeof Node)[]) => {
            if(selectedSequence != null)
                return;

            var failed: boolean = false;
            var good: boolean = false;

            sequence.forEach((nodeClass: typeof Node) => {
                if(failed || good)
                    return;

                if(nodeClass.startTokens.has(<typeof tokens.Token> queue[0].constructor))
                    good = true;
                else if(!nodeClass.canBeEmpty)
                    failed = true;
            });

            if(good && (!(i in Class.checkers) || Class.checkers[i](queue))) {
                selectedSequence = sequence;
            }

            i++;
        });

        if(selectedSequence != null) {
            selectedSequence.forEach((nodeClass: typeof Node) => {
                this._children.push(new nodeClass());
            });

            return this._children;
        }

        if(Class.canBeEmpty) {
            return [];
        }

        throw new ParseError('Invalid token encountered');
    }
}

export module SequenceNode {
    /*
     * Adds sequences to SequenceNode child class and calculates startTokens and canBeEmpty.
     */
    export function build(buildNodeClass: typeof SequenceNode, sequences: typeof Node[][], checkers: (typeof SequenceNode.checkers) = {}) {
        buildNodeClass.sequences = sequences;
        buildNodeClass.checkers = checkers;

        // Add starting tokens
        buildNodeClass.startTokens = new Set();
        sequences.forEach((sequence: typeof Node[]) => {
            var allCanBeEmpty: boolean = true;

            sequence.forEach((nodeClass: typeof Node) => {
                if(!allCanBeEmpty)
                    return;

                if(!nodeClass.canBeEmpty)
                    allCanBeEmpty = false;

                nodeClass.startTokens.forEach((tokenClass: typeof tokens.Token) => {
                    buildNodeClass.startTokens.add(tokenClass);
                });
            });
        });

        // Node can be empty if any of it's possible sequences can be empty
        sequences.forEach((sequence: typeof Node[]) => {
            var canBeEmpty: boolean = true;

            sequence.forEach((nodeClass: typeof Node) => {
                if(!nodeClass.canBeEmpty) {
                    canBeEmpty = false;
                }
            });

            if(canBeEmpty) {
                buildNodeClass.canBeEmpty = true;
            }
        });
    }
}

// TokenNodes
export class EOSTokenNode extends TokenNode {}
EOSTokenNode.startTokens = new Set();
EOSTokenNode.startTokens.add(tokens.EOSToken);

export class CommentTokenNode extends TokenNode {}
CommentTokenNode.startTokens = new Set();
CommentTokenNode.startTokens.add(tokens.CommentToken);

export class NotEqualTokenNode extends TokenNode {}
NotEqualTokenNode.startTokens = new Set();
NotEqualTokenNode.startTokens.add(tokens.NotEqualToken);

export class EqualTokenNode extends TokenNode {}
EqualTokenNode.startTokens = new Set();
EqualTokenNode.startTokens.add(tokens.EqualToken);

export class LessThanTokenNode extends TokenNode {}
LessThanTokenNode.startTokens = new Set();
LessThanTokenNode.startTokens.add(tokens.LessThanToken);

export class GreaterThanTokenNode extends TokenNode {}
GreaterThanTokenNode.startTokens = new Set();
GreaterThanTokenNode.startTokens.add(tokens.GreaterThanToken);

export class LessOrEqualTokenNode extends TokenNode {}
LessOrEqualTokenNode.startTokens = new Set();
LessOrEqualTokenNode.startTokens.add(tokens.LessOrEqualToken);

export class GreaterOrEqualTokenNode extends TokenNode {}
GreaterOrEqualTokenNode.startTokens = new Set();
GreaterOrEqualTokenNode.startTokens.add(tokens.GreaterOrEqualToken);

export class AdditionTokenNode extends TokenNode {}
AdditionTokenNode.startTokens = new Set();
AdditionTokenNode.startTokens.add(tokens.AdditionToken);

export class SubstractionTokenNode extends TokenNode {}
SubstractionTokenNode.startTokens = new Set();
SubstractionTokenNode.startTokens.add(tokens.SubstractionToken);

export class MultiplicationTokenNode extends TokenNode {}
MultiplicationTokenNode.startTokens = new Set();
MultiplicationTokenNode.startTokens.add(tokens.MultiplicationToken);

export class DivisionTokenNode extends TokenNode {}
DivisionTokenNode.startTokens = new Set();
DivisionTokenNode.startTokens.add(tokens.DivisionToken);

export class IntegerDivisionTokenNode extends TokenNode {}
IntegerDivisionTokenNode.startTokens = new Set();
IntegerDivisionTokenNode.startTokens.add(tokens.IntegerDivisionToken);

export class PowerTokenNode extends TokenNode {}
PowerTokenNode.startTokens = new Set();
PowerTokenNode.startTokens.add(tokens.PowerToken);

export class ModTokenNode extends TokenNode {}
ModTokenNode.startTokens = new Set();
ModTokenNode.startTokens.add(tokens.ModToken);

export class ConcatenationTokenNode extends TokenNode {}
ConcatenationTokenNode.startTokens = new Set();
ConcatenationTokenNode.startTokens.add(tokens.ConcatenationToken);

export class AndTokenNode extends TokenNode {}
AndTokenNode.startTokens = new Set();
AndTokenNode.startTokens.add(tokens.AndToken);

export class OrTokenNode extends TokenNode {}
OrTokenNode.startTokens = new Set();
OrTokenNode.startTokens.add(tokens.OrToken);

export class XorTokenNode extends TokenNode {}
XorTokenNode.startTokens = new Set();
XorTokenNode.startTokens.add(tokens.XorToken);

export class NotTokenNode extends TokenNode {}
NotTokenNode.startTokens = new Set();
NotTokenNode.startTokens.add(tokens.NotToken);

export class NumberTokenNode extends TokenNode {}
NumberTokenNode.startTokens = new Set();
NumberTokenNode.startTokens.add(tokens.NumberToken);

export class StringTokenNode extends TokenNode {}
StringTokenNode.startTokens = new Set();
StringTokenNode.startTokens.add(tokens.StringToken);

export class CommaTokenNode extends TokenNode {}
CommaTokenNode.startTokens = new Set();
CommaTokenNode.startTokens.add(tokens.CommaToken);

export class LeftParenthesisTokenNode extends TokenNode {}
LeftParenthesisTokenNode.startTokens = new Set();
LeftParenthesisTokenNode.startTokens.add(tokens.LeftParenthesisToken);

export class RightParenthesisTokenNode extends TokenNode {}
RightParenthesisTokenNode.startTokens = new Set();
RightParenthesisTokenNode.startTokens.add(tokens.RightParenthesisToken);

export class LeftBracketTokenNode extends TokenNode {}
LeftBracketTokenNode.startTokens = new Set();
LeftBracketTokenNode.startTokens.add(tokens.LeftBracketToken);

export class RightBracketTokenNode extends TokenNode {}
RightBracketTokenNode.startTokens = new Set();
RightBracketTokenNode.startTokens.add(tokens.RightBracketToken);

export class ForTokenNode extends TokenNode {}
ForTokenNode.startTokens = new Set();
ForTokenNode.startTokens.add(tokens.ForToken);

export class ToTokenNode extends TokenNode {}
ToTokenNode.startTokens = new Set();
ToTokenNode.startTokens.add(tokens.ToToken);

export class StepTokenNode extends TokenNode {}
StepTokenNode.startTokens = new Set();
StepTokenNode.startTokens.add(tokens.StepToken);

export class NextTokenNode extends TokenNode {}
NextTokenNode.startTokens = new Set();
NextTokenNode.startTokens.add(tokens.NextToken);

export class DoTokenNode extends TokenNode {}
DoTokenNode.startTokens = new Set();
DoTokenNode.startTokens.add(tokens.DoToken);

export class LoopTokenNode extends TokenNode {}
LoopTokenNode.startTokens = new Set();
LoopTokenNode.startTokens.add(tokens.LoopToken);

export class WhileTokenNode extends TokenNode {}
WhileTokenNode.startTokens = new Set();
WhileTokenNode.startTokens.add(tokens.WhileToken);

export class UntilTokenNode extends TokenNode {}
UntilTokenNode.startTokens = new Set();
UntilTokenNode.startTokens.add(tokens.UntilToken);

export class IfTokenNode extends TokenNode {}
IfTokenNode.startTokens = new Set();
IfTokenNode.startTokens.add(tokens.IfToken);

export class ThenTokenNode extends TokenNode {}
ThenTokenNode.startTokens = new Set();
ThenTokenNode.startTokens.add(tokens.ThenToken);

export class ElseIfTokenNode extends TokenNode {}
ElseIfTokenNode.startTokens = new Set();
ElseIfTokenNode.startTokens.add(tokens.ElseIfToken);

export class ElseTokenNode extends TokenNode {}
ElseTokenNode.startTokens = new Set();
ElseTokenNode.startTokens.add(tokens.ElseToken);

export class EndIfTokenNode extends TokenNode {}
EndIfTokenNode.startTokens = new Set();
EndIfTokenNode.startTokens.add(tokens.EndIfToken);

export class DimTokenNode extends TokenNode {}
DimTokenNode.startTokens = new Set();
DimTokenNode.startTokens.add(tokens.DimToken);

export class AsTokenNode extends TokenNode {}
AsTokenNode.startTokens = new Set();
AsTokenNode.startTokens.add(tokens.AsToken);

export class FunctionTokenNode extends TokenNode {}
FunctionTokenNode.startTokens = new Set();
FunctionTokenNode.startTokens.add(tokens.FunctionToken);

export class ReturnTokenNode extends TokenNode {}
ReturnTokenNode.startTokens = new Set();
ReturnTokenNode.startTokens.add(tokens.ReturnToken);

export class EndFunctionTokenNode extends TokenNode {}
EndFunctionTokenNode.startTokens = new Set();
EndFunctionTokenNode.startTokens.add(tokens.EndFunctionToken);

export class SubTokenNode extends TokenNode {}
SubTokenNode.startTokens = new Set();
SubTokenNode.startTokens.add(tokens.SubToken);

export class EndSubTokenNode extends TokenNode {}
EndSubTokenNode.startTokens = new Set();
EndSubTokenNode.startTokens.add(tokens.EndSubToken);

export class IdentifierTokenNode extends TokenNode {}
IdentifierTokenNode.startTokens = new Set();
IdentifierTokenNode.startTokens.add(tokens.IdentifierToken);

export class NewLineTokenNode extends TokenNode {}
NewLineTokenNode.startTokens = new Set();
NewLineTokenNode.startTokens.add(tokens.NewLineToken);

// Forward declare a few nodes
export class ExpressionNode extends SequenceNode {}
ExpressionNode.startTokens = new Set();
ExpressionNode.startTokens.add(tokens.LeftBracketToken);
ExpressionNode.startTokens.add(tokens.NotToken);
ExpressionNode.startTokens.add(tokens.SubstractionToken);
ExpressionNode.startTokens.add(tokens.IdentifierToken);

export class FunctionCallNode extends SequenceNode {}
FunctionCallNode.startTokens = new Set();
FunctionCallNode.startTokens.add(tokens.IdentifierToken);

// Generic nodes
export class LineEndNode extends SequenceNode {}
SequenceNode.build(LineEndNode, [
    [ NewLineTokenNode ],
    [ EOSTokenNode ]
]);

export class ConstantNode extends SequenceNode {}
SequenceNode.build(ConstantNode, [
    [ NumberTokenNode ],
    [ StringTokenNode ],
]);

export class VariableReferenceContinuationNode extends SequenceNode {}
SequenceNode.build(VariableReferenceContinuationNode, [
    [],
    [ LeftBracketTokenNode, ExpressionNode, RightBracketTokenNode, VariableReferenceContinuationNode ],
]);

export class VariableReferenceNode extends SequenceNode {}
SequenceNode.build(VariableReferenceNode, [
    [ IdentifierTokenNode, VariableReferenceContinuationNode ],
]);

export class ParameterListContinuationNode extends SequenceNode {}
SequenceNode.build(ParameterListContinuationNode, [
    [],
    [ CommaTokenNode, ExpressionNode, ParameterListContinuationNode ],
]);

export class ParameterListNode extends SequenceNode {}
SequenceNode.build(ParameterListNode, [
    [],
    [ ExpressionNode, ParameterListContinuationNode ],
]);

SequenceNode.build(FunctionCallNode, [
    [ VariableReferenceNode, LeftParenthesisTokenNode, ParameterListNode, RightParenthesisTokenNode ]
]);

export class Expression7Node extends SequenceNode {}
SequenceNode.build(Expression7Node, [
    [ LeftParenthesisTokenNode, ExpressionNode, RightParenthesisTokenNode ],
    [ NotTokenNode, Expression7Node ],
    [ SubstractionTokenNode, Expression7Node ],
    [ ConstantNode ],
    [ FunctionCallNode ],
    [ VariableReferenceNode ]
], {
    // It's a function call if the next token after identifier is (
    4: (queue: tokens.Token[]) => {
        return queue.length >= 2 && queue[1] instanceof tokens.LeftParenthesisToken;
    }
});

export class Expression6Node extends SequenceNode {}
SequenceNode.build(Expression6Node, [
    [ Expression7Node ],
    [ Expression6Node, PowerTokenNode, Expression7Node ]
]);

export class Expression5Node extends SequenceNode {}
SequenceNode.build(Expression5Node, [
    [ Expression6Node ],
    [ Expression5Node, MultiplicationTokenNode, Expression6Node ],
    [ Expression5Node, DivisionTokenNode, Expression6Node ],
    [ Expression5Node, IntegerDivisionTokenNode, Expression6Node ],
    [ Expression5Node, ModTokenNode, Expression6Node ],
]);


export class Expression4Node extends SequenceNode {}
SequenceNode.build(Expression4Node, [
    [ Expression5Node ],
    [ Expression4Node, AdditionTokenNode, Expression5Node ],
    [ Expression4Node, SubstractionTokenNode, Expression5Node ],
]);

export class Expression3Node extends SequenceNode {}
SequenceNode.build(Expression3Node, [
    [ Expression4Node ],
    [ Expression3Node, ConcatenationTokenNode, Expression4Node ],
]);

export class Expression2Node extends SequenceNode {}
SequenceNode.build(Expression2Node, [
    [ Expression3Node ],
    [ Expression2Node, EqualTokenNode, Expression3Node ],
    [ Expression2Node, NotEqualTokenNode, Expression3Node ],
    [ Expression2Node, LessThanTokenNode, Expression3Node ],
    [ Expression2Node, LessOrEqualTokenNode, Expression3Node ],
    [ Expression2Node, GreaterThanTokenNode, Expression3Node ],
    [ Expression2Node, GreaterOrEqualTokenNode, Expression3Node ],
]);

export class Expression1Node extends SequenceNode {}
SequenceNode.build(Expression1Node, [
    [ Expression2Node ],
    [ Expression1Node, OrTokenNode, Expression2Node ],
    [ Expression1Node, AndTokenNode, Expression2Node ],
    [ Expression1Node, XorTokenNode, Expression2Node ],
]);

SequenceNode.build(ExpressionNode, [
    [ Expression1Node ]
]);

export class TypeNode extends SequenceNode {}
TypeNode.startTokens = new Set();
TypeNode.startTokens.add(tokens.IdentifierToken);
TypeNode.startTokens.add(tokens.LeftParenthesisToken);

export class TypeListContinuationNode extends SequenceNode {}
SequenceNode.build(TypeListContinuationNode, [
    [],
    [ CommaTokenNode, TypeNode, TypeListContinuationNode ]
]);

export class TypeListNode extends SequenceNode {}
SequenceNode.build(TypeListNode, [
    [],
    [ CommaTokenNode, TypeNode, TypeListContinuationNode ]
]);

SequenceNode.build(TypeNode, [
    [ IdentifierTokenNode ],
    [ TypeNode, LeftBracketTokenNode, ExpressionNode, RightBracketTokenNode ],
    [ TypeNode, LeftParenthesisTokenNode, TypeListNode, RightParenthesisTokenNode ],
    [ LeftParenthesisTokenNode, TypeListNode, RightParenthesisTokenNode ]
]);

export class TypeSpecifierNode extends SequenceNode {}
SequenceNode.build(TypeSpecifierNode, [
    [ AsTokenNode, TypeNode ]
]);

export class InitializerNode extends SequenceNode {}
SequenceNode.build(InitializerNode, [
    [ EqualTokenNode, ExpressionNode ]
]);

export class OptionalInitializerNode extends SequenceNode {}
SequenceNode.build(OptionalInitializerNode, [
    [],
    [ InitializerNode ]
]);

export class VariableDefinitionEndingNode extends SequenceNode {}
SequenceNode.build(VariableDefinitionEndingNode, [
    [ TypeSpecifierNode, OptionalInitializerNode ],
    [ InitializerNode ]
]);

export class VariableDefinitionNode extends SequenceNode {}
SequenceNode.build(VariableDefinitionNode, [
    [ DimTokenNode, IdentifierTokenNode, VariableDefinitionEndingNode ],
]);

export class VariableAssignmentNode extends SequenceNode {}
SequenceNode.build(VariableAssignmentNode, [
    [ VariableReferenceNode, EqualTokenNode, ExpressionNode ]
]);

export class BaseFunctionCallNode extends SequenceNode {}
SequenceNode.build(BaseFunctionCallNode, [
    [ VariableReferenceNode, ParameterListNode ]
]);

export class ReturnStatementNode extends SequenceNode {}
SequenceNode.build(ReturnStatementNode, [
    [ ReturnTokenNode, ExpressionNode ]
]);

export class StatementNode extends SequenceNode {}
SequenceNode.build(StatementNode, [
    [ VariableDefinitionNode ],
    [ ReturnStatementNode ],
    [ FunctionCallNode ],
    [ VariableAssignmentNode ],
    [ BaseFunctionCallNode ]
]);

export class BlockNode extends SequenceNode {}
BlockNode.startTokens = new Set();
BlockNode.startTokens.add(tokens.IdentifierToken);
BlockNode.startTokens.add(tokens.NewLineToken);
BlockNode.startTokens.add(tokens.ForToken);
BlockNode.startTokens.add(tokens.DoToken);

export class ForStepNode extends SequenceNode {}
SequenceNode.build(ForStepNode, [
    [],
    [ StepTokenNode, ExpressionNode ]
]);

export class ForHeaderNode extends SequenceNode {}
SequenceNode.build(ForHeaderNode, [
    [ ForTokenNode, IdentifierTokenNode, EqualTokenNode, ExpressionNode, ToTokenNode, ExpressionNode, ForStepNode ]
]);

export class ForFooterNode extends SequenceNode {}
SequenceNode.build(ForFooterNode, [
    [ NextTokenNode, IdentifierTokenNode ]
]);

export class ForBlockNode extends SequenceNode {}
SequenceNode.build(ForBlockNode, [
        [ ForHeaderNode, NewLineTokenNode, BlockNode, ForFooterNode, LineEndNode ]
]);

export class OptionalLoopConditionNode extends SequenceNode {}
SequenceNode.build(OptionalLoopConditionNode, [
    [],
    [ WhileTokenNode, ExpressionNode ],
    [ UntilTokenNode, ExpressionNode ],
]);

export class DoBlockNode extends SequenceNode {}
SequenceNode.build(DoBlockNode, [
    [ DoTokenNode, OptionalLoopConditionNode, NewLineTokenNode, BlockNode, LoopTokenNode, OptionalLoopConditionNode, LineEndNode ]
]);

export class ElsePartNode extends SequenceNode {}
SequenceNode.build(ElsePartNode, [
    [],
    [ ElseTokenNode, StatementNode ]
]);

export class ElseIfBlockNode extends SequenceNode {}
SequenceNode.build(ElseIfBlockNode, [
    [],
    [ ElseIfTokenNode, ExpressionNode, ThenTokenNode, NewLineTokenNode, BlockNode, ElseIfBlockNode ]
]);

export class ElseBlockNode extends SequenceNode {}
SequenceNode.build(ElseBlockNode, [
    [],
    [ ElseTokenNode, NewLineTokenNode, BlockNode ]
]);

export class IfThenPartNode extends SequenceNode {}
SequenceNode.build(IfThenPartNode, [
    [ NewLineTokenNode, BlockNode, ElseIfBlockNode, ElseBlockNode, EndIfTokenNode, LineEndNode ],
    [ StatementNode, ElsePartNode, LineEndNode ],
]);

export class IfBlockNode extends SequenceNode {}
SequenceNode.build(IfBlockNode, [
    [ IfTokenNode, ExpressionNode, ThenTokenNode, IfThenPartNode ]
]);

SequenceNode.build(BlockNode, [
    [],
    [ LineEndNode, BlockNode ],
    [ DoBlockNode, BlockNode ],
    [ ForBlockNode, BlockNode ],
    [ IfBlockNode, BlockNode ],
    [ StatementNode, LineEndNode, BlockNode ],
]);

export class ParameterDefinitionListContinuationNode extends SequenceNode {}
SequenceNode.build(ParameterDefinitionListContinuationNode, [
    [],
    [ CommaTokenNode, IdentifierTokenNode, TypeSpecifierNode, ParameterListContinuationNode ]
]);

export class ParameterDefinitionListNode extends SequenceNode {}
SequenceNode.build(ParameterDefinitionListNode, [
    [],
    [ IdentifierTokenNode, TypeSpecifierNode, ParameterListContinuationNode ]
]);

export class FunctionDefinitionBlockNode extends SequenceNode {}
SequenceNode.build(FunctionDefinitionBlockNode, [
    [ FunctionTokenNode, IdentifierTokenNode, LeftParenthesisTokenNode, ParameterListNode, RightParenthesisTokenNode, TypeSpecifierNode, NewLineTokenNode, BlockNode, EndFunctionTokenNode, LineEndNode ]
]);

export class SubDefinitionBlockNode extends SequenceNode {}
SequenceNode.build(SubDefinitionBlockNode, [
    [ SubTokenNode, IdentifierTokenNode, LeftParenthesisTokenNode, ParameterListNode, RightParenthesisTokenNode, NewLineTokenNode, BlockNode, EndSubTokenNode, LineEndNode ]
]);

export class BaseLevelBlockNode extends SequenceNode {}
SequenceNode.build(BaseLevelBlockNode, [
    [],
    [ FunctionDefinitionBlockNode, BaseLevelBlockNode ],
    [ SubDefinitionBlockNode, BaseLevelBlockNode ],
    [ BlockNode, BaseLevelBlockNode ]
]);

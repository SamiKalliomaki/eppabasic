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

    getClassName() {
        // Dirty hack to get the class name. Won't work IE<9.
        return (<{name: string}><Object> this.constructor).name;
    }

    getNodeName() {
        return this.getClassName();
    }

    toString(level: number = 0): string {
        var str = '';

        for(var i = 0; i < level - 1; i++)
            str += '| ';

        if(level >= 1)
            str += '|-';


        str += this.getNodeName();

        this._children.forEach((child) => {
            str += '\n' + child.toString(level + 1);
        });

        return str;
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

    /**
     * Children of this node.
     */
    get children(): Node[] {
        return this._children;
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

        if (queue.length < 1) {
            throw new ParseError('No input for expanding ' + tokenToString(tokenClass));
        }

        if(queue[0] instanceof tokenClass) {
            this._token = queue[0];
            queue.shift();
            return [];
        }

        throw new ParseError('Invalid token encountered: '
                            + tokenToString(<typeof tokens.Token> queue[0].constructor)
                            + ' but expected ' + tokenToString(tokenClass));
    }

    /**
     * Token encapsured in this node.
     */
    get token(): tokens.Token {
        return this._token;
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
    static sequenceStartingTokens: Set<typeof tokens.Token>[];
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
        for(var i = 0; i < Class.sequences.length; i++) {
            if(Class.sequenceStartingTokens[i].has(<typeof tokens.Token> queue[0].constructor)
                && (!(i in Class.checkers) || Class.checkers[i](queue))) {

                Class.sequences[i].forEach((nodeClass: typeof Node) => {
                    this._children.push(new nodeClass());
                });

                return this._children;
            }
        };

        if(Class.canBeEmpty) {
            return [];
        }

        throw new ParseError('Invalid token encountered: '
                            + tokenToString(<typeof tokens.Token> queue[0].constructor)
                            + ' but expected one of ' + tokenSetToString(Class.startTokens));
    }
}

/*
 * Converts a set of Token types to string for better internal error messages.
 */
function tokenSetToString(set: Set<typeof tokens.Token>): string {
    var buf = [];
    set.forEach((value) => {
        buf.push(tokenToString(value));
    });
    return '{' + buf.join(', ') + '}';
}

/**
 * Converts a single Token type to string for better internal error messages.
 */
function tokenToString(token: typeof tokens.Token): string {
    return (<Function> token).name;
}

export module SequenceNode {
    /*
     * Adds sequences to SequenceNode child class and calculates startTokens and canBeEmpty.
     */
    export function build(buildNodeClass: typeof SequenceNode, sequences: typeof Node[][], checkers: (typeof SequenceNode.checkers) = {}) {
        buildNodeClass.sequences = sequences;
        buildNodeClass.sequenceStartingTokens = new Array(sequences.length);
        buildNodeClass.checkers = checkers;

        // Add starting tokens
        buildNodeClass.startTokens = new Set<typeof tokens.Token>();

        for(var i = 0; i < sequences.length; i++) {
            buildNodeClass.sequenceStartingTokens[i] = new Set<typeof tokens.Token>();

            for(var j = 0; j < sequences[i].length; j++) {
                sequences[i][j].startTokens.forEach((tokenClass: typeof tokens.Token) => {
                    buildNodeClass.sequenceStartingTokens[i].add(tokenClass);
                });

                if(!sequences[i][j].canBeEmpty)
                    break;
            }
        }

        for(var i = 0; i < sequences.length; i++) {
            for(var j = 0; j < i; j++) {
                buildNodeClass.sequenceStartingTokens[i].forEach((tokenClass) => {
                    if(buildNodeClass.sequenceStartingTokens[j].has(tokenClass)
                        && !(j in checkers)) {
                        throw Error("Checker must be provided for sequence " + j);
                    }
                });
            }
        }

        for(var i = 0; i < sequences.length; i++) {
            buildNodeClass.sequenceStartingTokens[i].forEach((tokenClass) => {
                buildNodeClass.startTokens.add(tokenClass);
            });
        }

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

/*
 * Helper function for checkers. Returns first token after variable reference, ie.
 * skips [ and ] -tokens and everything between them. Returns null if such token is
 * not available.
 */
function getTokenAfterVariableReference(tokenQueue) {
    var level = 0;

    for(var i = 1; i < tokenQueue.length; i++) {
        if(tokenQueue[i] instanceof tokens.LeftBracketToken) {
            level++;
        } else if(tokenQueue[i] instanceof tokens.RightBracketToken) {
            level--;
        } else if(level == 0) {
            return tokenQueue[i];
        }
    }

    return null;
}

// TokenNodes
export class EOSTokenNode extends TokenNode {}
EOSTokenNode.startTokens = new Set<typeof tokens.Token>();
EOSTokenNode.startTokens.add(tokens.EOSToken);

export class CommentTokenNode extends TokenNode {}
CommentTokenNode.startTokens = new Set<typeof tokens.Token>();
CommentTokenNode.startTokens.add(tokens.CommentToken);

export class NotEqualTokenNode extends TokenNode {}
NotEqualTokenNode.startTokens = new Set<typeof tokens.Token>();
NotEqualTokenNode.startTokens.add(tokens.NotEqualToken);

export class EqualTokenNode extends TokenNode {}
EqualTokenNode.startTokens = new Set<typeof tokens.Token>();
EqualTokenNode.startTokens.add(tokens.EqualToken);

export class LessThanTokenNode extends TokenNode {}
LessThanTokenNode.startTokens = new Set<typeof tokens.Token>();
LessThanTokenNode.startTokens.add(tokens.LessThanToken);

export class GreaterThanTokenNode extends TokenNode {}
GreaterThanTokenNode.startTokens = new Set<typeof tokens.Token>();
GreaterThanTokenNode.startTokens.add(tokens.GreaterThanToken);

export class LessOrEqualTokenNode extends TokenNode {}
LessOrEqualTokenNode.startTokens = new Set<typeof tokens.Token>();
LessOrEqualTokenNode.startTokens.add(tokens.LessOrEqualToken);

export class GreaterOrEqualTokenNode extends TokenNode {}
GreaterOrEqualTokenNode.startTokens = new Set<typeof tokens.Token>();
GreaterOrEqualTokenNode.startTokens.add(tokens.GreaterOrEqualToken);

export class AdditionTokenNode extends TokenNode {}
AdditionTokenNode.startTokens = new Set<typeof tokens.Token>();
AdditionTokenNode.startTokens.add(tokens.AdditionToken);

export class SubstractionTokenNode extends TokenNode {}
SubstractionTokenNode.startTokens = new Set<typeof tokens.Token>();
SubstractionTokenNode.startTokens.add(tokens.SubstractionToken);

export class MultiplicationTokenNode extends TokenNode {}
MultiplicationTokenNode.startTokens = new Set<typeof tokens.Token>();
MultiplicationTokenNode.startTokens.add(tokens.MultiplicationToken);

export class DivisionTokenNode extends TokenNode {}
DivisionTokenNode.startTokens = new Set<typeof tokens.Token>();
DivisionTokenNode.startTokens.add(tokens.DivisionToken);

export class IntegerDivisionTokenNode extends TokenNode {}
IntegerDivisionTokenNode.startTokens = new Set<typeof tokens.Token>();
IntegerDivisionTokenNode.startTokens.add(tokens.IntegerDivisionToken);

export class PowerTokenNode extends TokenNode {}
PowerTokenNode.startTokens = new Set<typeof tokens.Token>();
PowerTokenNode.startTokens.add(tokens.PowerToken);

export class ModTokenNode extends TokenNode {}
ModTokenNode.startTokens = new Set<typeof tokens.Token>();
ModTokenNode.startTokens.add(tokens.ModToken);

export class ConcatenationTokenNode extends TokenNode {}
ConcatenationTokenNode.startTokens = new Set<typeof tokens.Token>();
ConcatenationTokenNode.startTokens.add(tokens.ConcatenationToken);

export class AndTokenNode extends TokenNode {}
AndTokenNode.startTokens = new Set<typeof tokens.Token>();
AndTokenNode.startTokens.add(tokens.AndToken);

export class OrTokenNode extends TokenNode {}
OrTokenNode.startTokens = new Set<typeof tokens.Token>();
OrTokenNode.startTokens.add(tokens.OrToken);

export class XorTokenNode extends TokenNode {}
XorTokenNode.startTokens = new Set<typeof tokens.Token>();
XorTokenNode.startTokens.add(tokens.XorToken);

export class NotTokenNode extends TokenNode {}
NotTokenNode.startTokens = new Set<typeof tokens.Token>();
NotTokenNode.startTokens.add(tokens.NotToken);

export class NumberTokenNode extends TokenNode {
    getNodeName() {
        return this.getClassName() + ': ' + (<tokens.NumberToken> this.token).value;
    }
}
NumberTokenNode.startTokens = new Set<typeof tokens.Token>();
NumberTokenNode.startTokens.add(tokens.NumberToken);

export class StringTokenNode extends TokenNode {}
StringTokenNode.startTokens = new Set<typeof tokens.Token>();
StringTokenNode.startTokens.add(tokens.StringToken);

export class CommaTokenNode extends TokenNode {}
CommaTokenNode.startTokens = new Set<typeof tokens.Token>();
CommaTokenNode.startTokens.add(tokens.CommaToken);

export class LeftParenthesisTokenNode extends TokenNode {}
LeftParenthesisTokenNode.startTokens = new Set<typeof tokens.Token>();
LeftParenthesisTokenNode.startTokens.add(tokens.LeftParenthesisToken);

export class RightParenthesisTokenNode extends TokenNode {}
RightParenthesisTokenNode.startTokens = new Set<typeof tokens.Token>();
RightParenthesisTokenNode.startTokens.add(tokens.RightParenthesisToken);

export class LeftBracketTokenNode extends TokenNode {}
LeftBracketTokenNode.startTokens = new Set<typeof tokens.Token>();
LeftBracketTokenNode.startTokens.add(tokens.LeftBracketToken);

export class RightBracketTokenNode extends TokenNode {}
RightBracketTokenNode.startTokens = new Set<typeof tokens.Token>();
RightBracketTokenNode.startTokens.add(tokens.RightBracketToken);

export class ForTokenNode extends TokenNode {}
ForTokenNode.startTokens = new Set<typeof tokens.Token>();
ForTokenNode.startTokens.add(tokens.ForToken);

export class ToTokenNode extends TokenNode {}
ToTokenNode.startTokens = new Set<typeof tokens.Token>();
ToTokenNode.startTokens.add(tokens.ToToken);

export class StepTokenNode extends TokenNode {}
StepTokenNode.startTokens = new Set<typeof tokens.Token>();
StepTokenNode.startTokens.add(tokens.StepToken);

export class NextTokenNode extends TokenNode {}
NextTokenNode.startTokens = new Set<typeof tokens.Token>();
NextTokenNode.startTokens.add(tokens.NextToken);

export class DoTokenNode extends TokenNode {}
DoTokenNode.startTokens = new Set<typeof tokens.Token>();
DoTokenNode.startTokens.add(tokens.DoToken);

export class LoopTokenNode extends TokenNode {}
LoopTokenNode.startTokens = new Set<typeof tokens.Token>();
LoopTokenNode.startTokens.add(tokens.LoopToken);

export class WhileTokenNode extends TokenNode {}
WhileTokenNode.startTokens = new Set<typeof tokens.Token>();
WhileTokenNode.startTokens.add(tokens.WhileToken);

export class UntilTokenNode extends TokenNode {}
UntilTokenNode.startTokens = new Set<typeof tokens.Token>();
UntilTokenNode.startTokens.add(tokens.UntilToken);

export class IfTokenNode extends TokenNode {}
IfTokenNode.startTokens = new Set<typeof tokens.Token>();
IfTokenNode.startTokens.add(tokens.IfToken);

export class ThenTokenNode extends TokenNode {}
ThenTokenNode.startTokens = new Set<typeof tokens.Token>();
ThenTokenNode.startTokens.add(tokens.ThenToken);

export class ElseIfTokenNode extends TokenNode {}
ElseIfTokenNode.startTokens = new Set<typeof tokens.Token>();
ElseIfTokenNode.startTokens.add(tokens.ElseIfToken);

export class ElseTokenNode extends TokenNode {}
ElseTokenNode.startTokens = new Set<typeof tokens.Token>();
ElseTokenNode.startTokens.add(tokens.ElseToken);

export class EndIfTokenNode extends TokenNode {}
EndIfTokenNode.startTokens = new Set<typeof tokens.Token>();
EndIfTokenNode.startTokens.add(tokens.EndIfToken);

export class DimTokenNode extends TokenNode {}
DimTokenNode.startTokens = new Set<typeof tokens.Token>();
DimTokenNode.startTokens.add(tokens.DimToken);

export class AsTokenNode extends TokenNode {}
AsTokenNode.startTokens = new Set<typeof tokens.Token>();
AsTokenNode.startTokens.add(tokens.AsToken);

export class FunctionTokenNode extends TokenNode {}
FunctionTokenNode.startTokens = new Set<typeof tokens.Token>();
FunctionTokenNode.startTokens.add(tokens.FunctionToken);

export class ReturnTokenNode extends TokenNode {}
ReturnTokenNode.startTokens = new Set<typeof tokens.Token>();
ReturnTokenNode.startTokens.add(tokens.ReturnToken);

export class EndFunctionTokenNode extends TokenNode {}
EndFunctionTokenNode.startTokens = new Set<typeof tokens.Token>();
EndFunctionTokenNode.startTokens.add(tokens.EndFunctionToken);

export class SubTokenNode extends TokenNode {}
SubTokenNode.startTokens = new Set<typeof tokens.Token>();
SubTokenNode.startTokens.add(tokens.SubToken);

export class EndSubTokenNode extends TokenNode {}
EndSubTokenNode.startTokens = new Set<typeof tokens.Token>();
EndSubTokenNode.startTokens.add(tokens.EndSubToken);

export class IdentifierTokenNode extends TokenNode {}
IdentifierTokenNode.startTokens = new Set<typeof tokens.Token>();
IdentifierTokenNode.startTokens.add(tokens.IdentifierToken);

export class NewLineTokenNode extends TokenNode {}
NewLineTokenNode.startTokens = new Set<typeof tokens.Token>();
NewLineTokenNode.startTokens.add(tokens.NewLineToken);

// Forward declare a few nodes
export class ExpressionNode extends SequenceNode {}
ExpressionNode.startTokens = new Set<typeof tokens.Token>();
ExpressionNode.startTokens.add(tokens.LeftBracketToken);
ExpressionNode.startTokens.add(tokens.NotToken);
ExpressionNode.startTokens.add(tokens.SubstractionToken);
ExpressionNode.startTokens.add(tokens.IdentifierToken);
ExpressionNode.startTokens.add(tokens.NumberToken);
ExpressionNode.startTokens.add(tokens.StringToken);

export class FunctionCallNode extends SequenceNode {}
FunctionCallNode.startTokens = new Set<typeof tokens.Token>();
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
        return getTokenAfterVariableReference(queue) instanceof tokens.LeftParenthesisToken;
    }
});

export class Expression6ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression6ContinuationNode, [
    [ ],
    [ PowerTokenNode, Expression7Node, Expression6ContinuationNode ]
]);

export class Expression6Node extends SequenceNode {}
SequenceNode.build(Expression6Node, [
    [ Expression7Node, Expression6ContinuationNode ]
]);

export class Expression5ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression5ContinuationNode, [
    [ ],
    [ MultiplicationTokenNode, Expression6Node, Expression5ContinuationNode ],
    [ DivisionTokenNode, Expression6Node, Expression5ContinuationNode ],
    [ IntegerDivisionTokenNode, Expression6Node, Expression5ContinuationNode ],
    [ ModTokenNode, Expression6Node, Expression5ContinuationNode ]
]);

export class Expression5Node extends SequenceNode {}
SequenceNode.build(Expression5Node, [
    [ Expression6Node, Expression5ContinuationNode ]
]);

export class Expression4ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression4ContinuationNode, [
    [ ],
    [ AdditionTokenNode, Expression5Node, Expression4ContinuationNode ],
    [ SubstractionTokenNode, Expression5Node, Expression4ContinuationNode ]
]);

export class Expression4Node extends SequenceNode {}
SequenceNode.build(Expression4Node, [
    [ Expression5Node, Expression4ContinuationNode ]
]);

export class Expression3ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression3ContinuationNode, [
    [ ],
    [ ConcatenationTokenNode, Expression4Node, Expression3ContinuationNode ]
]);

export class Expression3Node extends SequenceNode {}
SequenceNode.build(Expression3Node, [
    [ Expression4Node, Expression3ContinuationNode ],
]);

export class Expression2ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression2ContinuationNode, [
    [ ],
    [ EqualTokenNode, Expression3Node, Expression2ContinuationNode ],
    [ NotEqualTokenNode, Expression3Node, Expression2ContinuationNode ],
    [ LessThanTokenNode, Expression3Node, Expression2ContinuationNode ],
    [ LessOrEqualTokenNode, Expression3Node, Expression2ContinuationNode ],
    [ GreaterThanTokenNode, Expression3Node, Expression2ContinuationNode ],
    [ GreaterOrEqualTokenNode, Expression3Node, Expression2ContinuationNode ]
]);

export class Expression2Node extends SequenceNode {}
SequenceNode.build(Expression2Node, [
    [ Expression3Node, Expression2ContinuationNode ]
]);

export class Expression1ContinuationNode extends SequenceNode {}
SequenceNode.build(Expression1ContinuationNode, [
    [ ],
    [ OrTokenNode, Expression2Node, Expression1ContinuationNode ],
    [ AndTokenNode, Expression2Node, Expression1ContinuationNode ],
    [ XorTokenNode, Expression2Node, Expression1ContinuationNode ]
]);

export class Expression1Node extends SequenceNode {}
SequenceNode.build(Expression1Node, [
    [ Expression2Node, Expression1ContinuationNode ],
]);

SequenceNode.build(ExpressionNode, [
    [ Expression1Node ]
]);

export class TypeNode extends SequenceNode {}
TypeNode.startTokens = new Set<typeof tokens.Token>();
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
    [ TypeNode, TypeListContinuationNode ]
]);

export class TypeContinuationNode extends SequenceNode {}
SequenceNode.build(TypeContinuationNode, [
    [ ],
    [ LeftBracketTokenNode, ExpressionNode, RightBracketTokenNode , TypeContinuationNode ],
    [ LeftParenthesisTokenNode, TypeListNode, RightParenthesisTokenNode, TypeContinuationNode ],
]);

SequenceNode.build(TypeNode, [
    [ IdentifierTokenNode, TypeContinuationNode ],
    [ LeftParenthesisTokenNode, TypeListNode, RightParenthesisTokenNode, TypeContinuationNode ]
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
], {
    // It's a function call if the next token after identifier is (
    2: (queue: tokens.Token[]) => {
        return getTokenAfterVariableReference(queue) instanceof tokens.LeftParenthesisToken;
    },
    // It's a variable assignment if the next token after identifier is =
    3: (queue: tokens.Token[]) => {
        return getTokenAfterVariableReference(queue) instanceof tokens.EqualToken;
    }
});

export class BlockNode extends SequenceNode {}
BlockNode.startTokens = new Set<typeof tokens.Token>();
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

define(['./parseError', 'compiler/frontend/lexer/tokens'], function(parseError, tokens) {
    "use strict";

    var ParseError = parseError.ParseError;

    function Token() {
        this.childNodes = [];
    }

    Token.prototype.first = {};
    Token.prototype.canBeEmpty = false;

    Token.prototype.doMove = function doMove(tokens) {
        throw new Error("Must be implemented");
    }

    function makeTerminalNode(token) {
        function TerminalNode() {
            Token.call(this);
        }

        TerminalNode.prototype = Object.create(Token.prototype);

        TerminalNode.prototype.first[token] = true;

        TerminalNode.prototype.doMove = function doMove(tokens) {
            if(tokens[0] instanceof token) {
                this.token = tokens.shift();
            } else {
                throw new ParseError();
            }
        }

        return TerminalNode;
    }

    function getAlternativeFirst(alternative) {
        var first = {};

        for(var i = 0; i < alternative.length; i++) {
            for(var f in alternative[i].first) {
                first[f] = true;
            }

            if(!alternative[i].canBeEmpty)
                break;
        }

        return first;
    }

    function getAlternativeFirsts(alternatives) {
        return alternatives.map(getAlternativeFirst);
    }

    function addSetToSet(from, to) {
        for(var f in from) {
            to[f] = true;
        }
    }

    function addSetsToSet(sets, set) {
        for(var i = 0; i < sets.length; i++) {
            addSetToSet(sets[i], set);
        }
    }

    function makeGeneralNode(alternatives) {
        function GeneralNode() {
            Token.call(this);
        }

        GeneralNode.prototype = Object.create(Token.prototype);

        var alternativeFirsts = getAlternativeFirsts(alternatives);
        addSetsToSet(alternativeFirsts, GeneralNode.prototype.first);

        for(var i = 0; i < alternatives.length; i++) {
            var canAlternativeBeEmpty = true;

            for(var j = 0; j < alternatives[i].length; j++) {
                if(!alternatives[i][j].canBeEmpty) {
                    canAlternativeBeEmpty = false;
                    break;
                }
            }

            if(canAlternativeBeEmpty) {
                GeneralNode.prototype.canBeEmpty = true;
                break;
            }
        }

        GeneralNode.prototype.doMove = function doMove(tokens) {
            for(var i = 0; i < alternatives.length; i++) {
                for(var f in alternativeFirsts[i]) {
                    if(tokens[0] instanceof f) {
                        for(var j = 0; j < alternatives[i].length; j++) {
                            this.childNodes.push(new alternatives[i][j]);
                        }

                        return this.childNodes;
                    }
                }
            }

            if(this.canBeEmpty) {
                return this.childNodes;
            }

            throw new ParseError();
        }

        return GeneralNode;
    }

    function makeNodeWithRepeat(alternatives, repeatAlternatives) {
        GeneralNode = makeGeneralNode(alternatives);

        function RepeatNode() {
            GeneralNode.call(this);
        }

        function PossibleRepeatNode(parent) {
            GeneralNode.call(this);

            this.parent = parent;
        }

        RepeatNode.prototype = Object.create(GeneralNode.prototype);
        PossibleRepeatNode.prototype = Object.create(GeneralNode.prototype);

        var repeatAlternativeFirsts = getAlternativeFirsts(repeatAlternatives);

        if(GeneralNode.prototype.canBeEmpty) {
            addSetsToSet(repeatAlternativeFirsts, RepeatNode.prototype.first);
        }

        addSetsToSet(repeatAlternativeFirsts, PossibleRepeatNode.prototype.first);

        RepeatNode.prototype.doMove = function doMove(tokens) {
            return GeneralNode.prototype.doMove.call(this, tokens).concat([new PossibleRepeatNode(this)]);
        }

        PossibleRepeatNode.prototype.doMove = function doMove(tokens) {
            for(var i = 0; i < repeatAlternatives.length; i++) {
                for(var f in repeatAlternativeFirsts[i]) {
                    if(tokens[0] instanceof f) {
                        var child = new RepeatNode();
                        child.childNodes = this.parent.childNodes;
                        this.parent.childNodes = [child];

                        for(var j = 0; j < repeatAlternatives[i].length; j++) {
                            this.parent.childNodes.push(new repeatAlternatives[i][j]);
                        }

                        return this.parent.childNodes.slice(1);
                    }
                }
            }

            return [];
        }

        return RepeatNode;
    }

    function makeDummyNode(first, canBeEmpty) {
        function DummyNode() {

        }

        DummyNode.prototype.first = first;
        DummyNode.prototype.canBeEmpty = canBeEmpty;

        return DummyNode;
    }

    NumberNode              = makeTerminalNode(tokens.NumberToken               );
    StringNode              = makeTerminalNode(tokens.StringToken               );
    IdentifierNode          = makeTerminalNode(tokens.IdentifierToken           );
    LeftBracketNode         = makeTerminalNode(tokens.LeftBracketToken          );
    RightBracketNode        = makeTerminalNode(tokens.RightBracketToken         );
    LeftParenthesisNode     = makeTerminalNode(tokens.LeftParenthesisToken      );
    RightParenthesisNode    = makeTerminalNode(tokens.RightParenthesisToken     );
    CommaNode               = makeTerminalNode(tokens.CommaToken                );
    NotNode                 = makeTerminalNode(tokens.NotToken                  );
    PowNode                 = makeTerminalNode(tokens.PowToken                  );
    MultiplicationNode      = makeTerminalNode(tokens.MultiplicationToken       );
    DivisionNode            = makeTerminalNode(tokens.DivisionToken             );
    IntegerDivisionNode     = makeTerminalNode(tokens.IntegerDivisionToken      );
    ModNode                 = makeTerminalNode(tokens.ModToken                  );
    PlusNode                = makeTerminalNode(tokens.PlusToken                 );
    MinusNode               = makeTerminalNode(tokens.MinusToken                );
    EqualNode               = makeTerminalNode(tokens.EqualToken                );
    NotEqualNode            = makeTerminalNode(tokens.NowEqualToken             );
    LessThanNode            = makeTerminalNode(tokens.LessThanToken             );
    LessThanOrEqualNode     = makeTerminalNode(tokens.LessThanOrEqualToken      );
    GreaterThanNode         = makeTerminalNode(tokens.GreaterThanToken          );
    GreaterThanOrEqualNode  = makeTerminalNode(tokens.GreaterThanOrEqualToken   );


    ExpressionNode  = makeDummyNode([tokens.LeftParenthesisToken, tokens.NotToken, tokens.NumberToken, tokens.StringToken, tokens.IdentifierToken, tokens.minusToken], false);
    Expression7Node = makeDummyNode([tokens.LeftParenthesisToken, tokens.NotToken, tokens.NumberToken, tokens.StringToken, tokens.IdentifierToken, tokens.minusToken], false);


    ConstantNode = makeGeneralNode([
        [NumberNode],
        [GeneralNode]
    ]);

    VariableReferenceNode = makeNodeWithRepeat(
        [
            [IdentifierNode]
        ],
        [
            [LeftBracketNode, NumberNode, RightBracketNode]
        ]
    );

    ParameterListNode = makeNodeWithRepeat(
        [
            [ExpressionNode],
            []
        ],
        [
            [CommaNode, ExpressionNode]
        ]
    );

    FunctionCallNode = makeGeneralNode([
        [VariableReferenceNode, LeftParenthesisNode, ParameterListNode, RightParenthesisNode]
    ]);

    Expression7Node.prototype = makeGeneralNode([
        [LeftParenthesisNode, ExpressionNode, RightParenthesisNode],
        [NotNode, Expression7Node],
        [MinusNode, Expression7Node],
        [ConstantNode],
        [FunctionCallNode],
        [IdentifierNode]
    ]).prototype;

    Expression6Node = makeNodeWithRepeat(
        [
            [Expression7Node],
        ],
        [
            [PowNode, Expression7Node]
        ]
    );

    Expression5Node = makeNodeWithRepeat(
        [
            [Expression6Node],
        ],
        [
            [MultiplicationNode, Expression6Node],
            [DivisionNode, Expression6Node],
            [IntegerDivisionNode, Expression6Node],
            [ModNode, Expression6Node]
        ]
    );
});
define(['./parseError', 'compiler/frontend/lexer/tokens'], function (parseError, tokens) {
    "use strict";

    var ParseError = parseError.ParseError;

    /**
     * Astract base class for all nodes
     * 
     * @class
     * @abstract
     * @private
     * @memberOf module:compiler/frontend/parser
     */
    function Node() {
        this.childNodes = [];
    }

    /**
     * Set of first tokens the node can begin with
     * 
     * @type {Set<module:compiler/frontend/lexer/tokens.Token>}
     * @memberOf module:compiler/frontend/parser.Node
     */
    Node.prototype.first = new Set();
    /**
     * Something else
     */
    Node.prototype.canBeEmpty = false;

    /**
     * Consumes one or more tokens from the tokens and creates a new node
     * Moves something from somewhere to somewhere
     * 
     * TODO Expand explanation
     * @abstract
     * @memberOf module:compiler/frontend/parser.Node
     */
    Node.prototype.doMove = function doMove(tokens) {
        throw new Error("Must be implemented");
    }

    /**
     * Creates a new TerminalNode class
     * 
     * @param {Class<module:compiler/frontend/lexer/tokens.Token>} token - Class of token to expand 
     * @returns {Class<module:compiler/frontend/parser.Node>} Constructor for a new terminal node
     * 
     * @private
     * @static
     * @memberOf module:compiler/frontend/parser
     */
    function makeTerminalNode(name, token) {
        // Create a new TerminalNode class extended from Node
        function TerminalNode() {
            Node.call(this);
        }
        Object.setPrototypeOf(TerminalNode, Node);
        TerminalNode.prototype = Object.create(Node.prototype, { constructor: { value: TerminalNode } });
        TerminalNode.typeName = name;
        
        if (token === undefined)
            throw Error("Token cannot be undefined.");
        else
            console.log(token.prototype.pattern);

        // Create set of first tokens
        TerminalNode.prototype.first = new Set();
        TerminalNode.prototype.first.add(token);

        // Replace the doMove-function
        TerminalNode.prototype.doMove = function doMove(tokens) {
            // Check that the first token in the list is right type
            if (tokens[0] instanceof token) {
                this.token = tokens.shift();
            } else {
                // If not, throw an error
                throw new ParseError();
            }

            return [];
        }

        return TerminalNode;
    }

    /**
     * Combines the first sets of the alternative nodes
     * 
     * @param {Array<module:compiler/frontend/parser.Node>} alternatives - Alternatives whose first sets to combine
     * @returns {Set<module:compiler/frontend/lexer/tokens.Token>} Combined first set
     * 
     * @private
     * @static
     * @memberOf module:compiler/frontend/parser
     */
    function combineFirstSets() { }
    function getAlternativeFirst(alternative) {
        // Create the return set
        var first = new Set();
        
        var goneBad = false;

        // Go through alternatives
        alternative.forEach(function (node) {
            if (goneBad)
                return;

            // Copy every element to the result
            node.prototype.first.forEach(function (token) {
                first.add(token);
            });

            if (!node.canBeEmpty)
                goneBad = true;
        });

        return first;
    }

    function getAlternativeFirsts(alternatives) {
        return alternatives.map(getAlternativeFirst);
    }

    function addSetToSet(from, to) {
        from.forEach(function (f) {
            if (f === undefined)
                throw new Error("Refusing to add undefined");

            to.add(f);
        });
    }

    function addSetsToSet(sets, set) {
        for (var i = 0; i < sets.length; i++) {
            addSetToSet(sets[i], set);
        }
    }

    /**
     * Creates a new GeneralNode class
     * 
     * General nodes combine multiple node type lists to one node type
     * 
     * @param {Array<Array<Class<module:compiler/frontend/parser.Node>>>} alternatives - Array of node combinations
     * @returns {Class<module:compiler/frontend/parser.Node>} Constructor for a new general node
     * 
     * @private
     * @static
     * @memberOf module:compiler/frontend/parser
     */
    function makeGeneralNode(name, alternatives) {
        // Create a new GeneralNode class extended from Node
        function GeneralNode() {
            Node.call(this);
        }

        Object.setPrototypeOf(GeneralNode, Node);
        GeneralNode.prototype = Object.create(Node.prototype, { constructor: { value: GeneralNode } });
        GeneralNode.typeName = name;
        GeneralNode.prototype.first = new Set();

        // Combine alternative first sets
        var alternativeFirsts = getAlternativeFirsts(alternatives);
        // TODO: Append alternative first set with general nodes empty first set?!
        addSetsToSet(alternativeFirsts, GeneralNode.prototype.first);

        for (var i = 0; i < alternatives.length; i++) {
            var canAlternativeBeEmpty = true;

            for (var j = 0; j < alternatives[i].length; j++) {
                if (!alternatives[i][j].canBeEmpty) {
                    canAlternativeBeEmpty = false;
                    break;
                }
            }

            if (canAlternativeBeEmpty) {
                GeneralNode.prototype.canBeEmpty = true;
                break;
            }
        }

        // Replace the doMove-function
        GeneralNode.prototype.doMove = function doMove(tokens) {
            // Go through all alternatives
            for (var i = 0; i < alternatives.length; i++) {
                var result = null;

                alternativeFirsts[i].forEach(function (f) {
                    console.log(f.prototype.pattern);

                    if (tokens[0] instanceof f) {
                        for (var j = 0; j < alternatives[i].length; j++) {
                            this.childNodes.push(new alternatives[i][j]);
                        }
                        
                        result = this.childNodes;
                    }
                }, this);

                if (result)
                    return result;
            }

            if (this.canBeEmpty) {
                return this.childNodes;
            }

            throw new ParseError();
        }

        return GeneralNode;
    }

    function makeNodeWithRepeat(name, alternatives, repeatAlternatives) {
        var GeneralNode = makeGeneralNode(name + 'GeneralNode', alternatives);

        function RepeatNode() {
            GeneralNode.call(this);
        }

        function PossibleRepeatNode(parent) {
            GeneralNode.call(this);

            this.parent = parent;
        }

        RepeatNode.prototype = Object.create(GeneralNode.prototype, { constructor: { value: RepeatNode } });
        RepeatNode.typeName = name;
        RepeatNode.prototype.first = new Set();
        addSetToSet(GeneralNode.prototype.first, RepeatNode.prototype.first);
        PossibleRepeatNode.prototype = Object.create(GeneralNode.prototype, { constructor: { value: PossibleRepeatNode } });
        PossibleRepeatNode.typeName = name + 'PossibleRepeatNode';
        PossibleRepeatNode.prototype.first = new Set();
        addSetToSet(GeneralNode.prototype.first, PossibleRepeatNode.prototype.first);

        var repeatAlternativeFirsts = getAlternativeFirsts(repeatAlternatives);

        if (GeneralNode.prototype.canBeEmpty) {
            addSetsToSet(repeatAlternativeFirsts, RepeatNode.prototype.first);
        }

        addSetsToSet(repeatAlternativeFirsts, PossibleRepeatNode.prototype.first);

        RepeatNode.prototype.doMove = function doMove(tokens) {
            return GeneralNode.prototype.doMove.call(this, tokens).concat([new PossibleRepeatNode(this)]);
        }

        PossibleRepeatNode.prototype.doMove = function doMove(tokens) {
            for (var i = 0; i < repeatAlternatives.length; i++) {
                for (var f in repeatAlternativeFirsts[i]) {
                    if (tokens[0] instanceof f) {
                        var child = new RepeatNode();
                        child.childNodes = this.parent.childNodes;
                        this.parent.childNodes = [child];

                        for (var j = 0; j < repeatAlternatives[i].length; j++) {
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

    function makeDummyNode(name, first, canBeEmpty) {
        function DummyNode() {
            Node.call(this);
        }
        
        DummyNode.typeName = name;
        DummyNode.prototype.first = first;
        DummyNode.prototype.canBeEmpty = canBeEmpty;

        return DummyNode;
    }



    // --- BNF ---
    var NumberNode = makeTerminalNode('NumberNode', tokens.NumberToken);
    var StringNode = makeTerminalNode('StringNode', tokens.StringToken);
    var IdentifierNode = makeTerminalNode('IdentifierNode', tokens.IdentifierToken);
    var LeftBracketNode = makeTerminalNode('LeftBracketNode', tokens.LeftBracketToken);
    var RightBracketNode = makeTerminalNode('RightBracketNode', tokens.RightBracketToken);
    var LeftParenthesisNode = makeTerminalNode('LeftParenthesisNode', tokens.LeftParenthesisToken);
    var RightParenthesisNode = makeTerminalNode('RightParenthesisNode', tokens.RightParenthesisToken);
    var CommaNode = makeTerminalNode('CommaNode', tokens.CommaToken);
    var NotNode = makeTerminalNode('NotNode', tokens.NotToken);
    var PowNode = makeTerminalNode('PowNode', tokens.PowToken);
    var MultiplicationNode = makeTerminalNode('MultiplicationNode', tokens.MultiplicationToken);
    var DivisionNode = makeTerminalNode('DivisionNode', tokens.DivisionToken);
    var IntegerDivisionNode = makeTerminalNode('IntegerDivisionNode', tokens.IntegerDivisionToken);
    var ModNode = makeTerminalNode('ModNode', tokens.ModToken);
    var PlusNode = makeTerminalNode('PlusNode', tokens.PlusToken);
    var MinusNode = makeTerminalNode('MinusNode', tokens.MinusToken);
    var EqualNode = makeTerminalNode('EqualNode', tokens.EqualToken);
    var NotEqualNode = makeTerminalNode('NotEqualNode', tokens.NotEqualToken);
    var LessThanNode = makeTerminalNode('LessThanNode', tokens.LessThanToken);
    var LessThanOrEqualNode = makeTerminalNode('LessThanOrEqualNode', tokens.LessThanOrEqualToken);
    var GreaterThanNode = makeTerminalNode('GreaterThanNode', tokens.GreaterThanToken);
    var GreaterThanOrEqualNode = makeTerminalNode('GreaterThanOrEqualNode', tokens.GreaterThanOrEqualToken);
    var ConcatNode = makeTerminalNode('ConcatNode', tokens.ConcatToken);
    var OrNode = makeTerminalNode('OrNode', tokens.OrToken);
    var AndNode = makeTerminalNode('AndNode', tokens.AndToken);
    var XorNode = makeTerminalNode('XorNode', tokens.XorToken);
    var AsNode = makeTerminalNode('AsNode', tokens.AsToken);


    var ExpressionNode = makeDummyNode('ExpressionNode', [tokens.LeftParenthesisToken, tokens.NotToken, tokens.NumberToken, tokens.StringToken, tokens.IdentifierToken, tokens.MinusToken], false);
    var Expression7Node = makeDummyNode('Expression7Node', [tokens.LeftParenthesisToken, tokens.NotToken, tokens.NumberToken, tokens.StringToken, tokens.IdentifierToken, tokens.MinusToken], false);
    var TypeNode = makeDummyNode('TypeNode', [tokens.IdentifierToken, tokens.LeftParenthesisToken], false);

    var ConstantNode = makeGeneralNode('ConstantNode', [
        [NumberNode],
        [StringNode]
    ]);

    var VariableReferenceNode = makeNodeWithRepeat('VariableReferenceNode', 
        [
            [IdentifierNode]
        ],
        [
            [LeftBracketNode, NumberNode, RightBracketNode]
        ]
    );

    var NonEmptyParameterListNode = makeNodeWithRepeat('NonEmptyParameterListNode',
        [
            [ExpressionNode]
        ],
        [
            [CommaNode, ExpressionNode]
        ]
    );

    var ParameterListNode = makeGeneralNode('ParameterListNode', [
        [NonEmptyParameterListNode],
        []
    ]);

    var FunctionCallNode = makeGeneralNode('FunctionCallNode', [
        [VariableReferenceNode, LeftParenthesisNode, ParameterListNode, RightParenthesisNode]
    ]);

    Expression7Node.prototype = makeGeneralNode('Expression7Node', [
        [LeftParenthesisNode, ExpressionNode, RightParenthesisNode],
        [NotNode, Expression7Node],
        [MinusNode, Expression7Node],
        [ConstantNode],
        [FunctionCallNode],
        [IdentifierNode]
    ]).prototype;

    var Expression6Node = makeNodeWithRepeat('Expression6Node', 
        [
            [Expression7Node]
        ],
        [
            [PowNode, Expression7Node]
        ]
    );

    var Expression5Node = makeNodeWithRepeat('Expression5Node', 
        [
            [Expression6Node]
        ],
        [
            [MultiplicationNode, Expression6Node],
            [DivisionNode, Expression6Node],
            [IntegerDivisionNode, Expression6Node],
            [ModNode, Expression6Node]
        ]
    );

    var Expression4Node = makeNodeWithRepeat('Expression4Node', 
        [
            [Expression5Node]
        ],
        [
            [PlusNode, Expression5Node],
            [MinusNode, Expression5Node]
        ]
    );

    var Expression3Node = makeNodeWithRepeat('Expression3Node', 
        [
            [Expression4Node]
        ],
        [
            [ConcatNode, Expression4Node]
        ]
    );

    var Expression2Node = makeNodeWithRepeat('Expression2Node', 
        [
            [Expression3Node]
        ],
        [
            [EqualNode, Expression3Node],
            [NotEqualNode, Expression3Node],
            [LessThanNode, Expression3Node],
            [LessThanOrEqualNode, Expression3Node],
            [GreaterThanNode, Expression3Node],
            [GreaterThanOrEqualNode, Expression3Node]
        ]
    );

    var Expression1Node = makeNodeWithRepeat('Expression1Node', 
        [
            [Expression2Node]
        ],
        [
            [OrNode, Expression2Node],
            [AndNode, Expression2Node],
            [XorNode, Expression2Node]
        ]
    );

    ExpressionNode.prototype = makeGeneralNode('ExpressionNode', [[Expression1Node]]).prototype;

    var NonEmptyTypeListNode = makeNodeWithRepeat('NonEmptyTypeListNode', 
        [
            [TypeNode]
        ],
        [
            [CommaNode, TypeNode]
        ]
    );

    var TypeListNode = makeGeneralNode('TypeListNode', [
        [NonEmptyTypeListNode],
        []
    ]);

    var TypeNode = makeNodeWithRepeat('TypeNode', 
        [
            [IdentifierNode],
            [LeftParenthesisNode, TypeListNode, RightParenthesisNode]
        ],
        [
            [LeftBracketNode, NumberNode, RightBracketNode],
            [LeftParenthesisNode, TypeListNode, RightParenthesisNode]
        ]
    );

    var TypeSpecifierNode = makeGeneralNode('TypeSpecifierNode', [
        [AsNode, TypeNode]
    ]);

    var InitializerNode = makeGeneralNode('InitializerNode', [
        [EqualNode, ExpressionNode]
    ]);

    var VariableDefinitionNode;
    var VariableAssignmentNode;
    var BaseFunctionCallNode;
    var ReturnStatementNode;

    // TODO: more
    var StatementNode = makeGeneralNode('StatementNode', [
        [ FunctionCallNode ]
    ]);

    // TODO: more
    var BlockStatementNode = makeGeneralNode('BlockStatementNode', [
        [ StatementNode ]
    ]);

    var BlockNode = makeNodeWithRepeat('BlockNode', 
        [
            [ BlockStatementNode ]
        ],
        [
            []
        ]
    );

    // TODO: more
    var BaseLevelStatementNode = makeGeneralNode('BaseLevelStatementNode', [
        [ BlockStatementNode ]
    ]);

    var BaseLevelBlockNode = makeNodeWithRepeat('BaseLevelBlockNode', 
        [
            [ BaseLevelStatementNode ]
        ],
        [
            []
        ]
    );
    

    return {
        BaseLevelBlockNode: BaseLevelBlockNode
    };
});
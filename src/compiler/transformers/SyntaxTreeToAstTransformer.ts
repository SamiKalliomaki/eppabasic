/// <reference path="../../../lib/vendor" />

import Transformer = require('./Transformer');
import SyntaxTreeProgram = require('../programs/SyntaxTreeProgram');
import SyntaxTree = require('../programs/syntaxTreeProgram/SyntaxTree');
import SyntaxTreeNodes = require('../programs/syntaxTreeProgram/nodes');
import AstProgram = require('../programs/AstProgram');
import Ast = require('../programs/astProgram/Ast');
import AstNodes = require('../programs/astProgram/nodes');
import tokens = require('../programs/tokenProgram/tokens');

class SyntaxTreeToAstTransformer implements Transformer {
    /**
     * Transforms from syntax tree program to ast program.
     *
     * @param source Program to be transformed
     *
     * @returns Promise of transformed program.
     */
    transform(source: SyntaxTreeProgram): Promise<AstProgram> {
        console.log(source.mainFile.root.toString());
        return new Promise<AstProgram>((resolve: (program: AstProgram) => void, reject: (error: any) => void) => {
            var files = new Set<Ast>();
            var mainFile: Ast = this.transformFile(source.mainFile);

            source.files.forEach((file: SyntaxTree) => {
                files.add(this.transformFile(file));
            });

            resolve(new AstProgram(files, mainFile));
        });
    }

    private transformFile(file: SyntaxTree): Ast {
        var flattened = this.postOrderFlatten(file);

        // Transform all nodes in by traversiong flattened tree in order.
        // Post order ensures that the children are transfromed before parent.
        var transformResults = new Map<SyntaxTreeNodes.Node, AstNodes.Node>();
        var transformers = this.getTransformers();
        flattened.forEach((sourceNode) => {
            var sourceType = <typeof SyntaxTreeNodes.Node> sourceNode.constructor;
            var transform = transformers.get(sourceType);
            if (!transform)
                // TODO: Throw error instead of logging it
                console.error(new Error('No defined node transformer for ' + sourceType.name));
            else
                transformResults.set(sourceNode, transform(sourceNode, transformResults));
        });

        console.log(file.root.toString());
        console.log(flattened);
        return new Ast();
    }

    /**
     * Flattens a source tree in post order.
     *
     * @param tree Tree to transform
     * @returns Flattened tree
     */
    private postOrderFlatten(tree: SyntaxTree): SyntaxTreeNodes.Node[] {
        var flattened: SyntaxTreeNodes.Node[] = [];
        var flatQueue: SyntaxTreeNodes.Node[] = [tree.root];

        // Do a pre order flattening...
        while (flatQueue.length > 0) {
            var flat = flatQueue.pop();
            flattened.push(flat);
            flatQueue = flatQueue.concat(flat.children);
        }

        // ...and then reverse to get post order
        return flattened.reverse();
    }

    private static transformers: Map<typeof SyntaxTreeNodes.Node, NodeTransformer> = null;
    private getTransformers() {
        if (SyntaxTreeToAstTransformer.transformers !== null)
            return SyntaxTreeToAstTransformer.transformers;

        // Shorthand for node collection
        var N = SyntaxTreeNodes;

        var transformers = new Map<typeof SyntaxTreeNodes.Node, NodeTransformer>([
            // Dummy nodes
            [N.DimTokenNode, dummyTokenTransformer],
            [N.IdentifierTokenNode, dummyTokenTransformer],
            [N.EqualTokenNode, dummyTokenTransformer],
            [N.LineEndNode, dummyTokenTransformer],
            [N.EOSTokenNode, dummyTokenTransformer],
            // Defer nodes
            [N.StatementNode, deferTransformer],
            [N.ExpressionNode, deferTransformer],
            [N.InitializerNode, initializerTransformer],
            // Block nodes
            [N.BaseLevelBlockNode, baseLevelBlockTransformer],
            [N.BlockNode, blockTransformer],
            // Expressions
            [N.Expression7Node, expression7Transformer],
            [N.Expression6Node, expression123456Transformer],
            [N.Expression5Node, expression123456Transformer],
            [N.Expression4Node, expression123456Transformer],
            [N.Expression3Node, expression123456Transformer],
            [N.Expression2Node, expression123456Transformer],
            [N.Expression1Node, expression123456Transformer],
            [N.Expression6ContinuationNode, expression6ContinuationTransformer],
            [N.Expression5ContinuationNode, expression5ContinuationTransformer],
            [N.Expression4ContinuationNode, expression4ContinuationTransformer],
            [N.Expression3ContinuationNode, expression3ContinuationTransformer],
            [N.Expression2ContinuationNode, expression2ContinuationTransformer],
            [N.Expression1ContinuationNode, expression1ContinuationTransformer],
            // Constant nodes
            [N.NumberTokenNode, numberTokenTransformer],
            [N.StringTokenNode, stringTokenTransformer],
            [N.ConstantNode, deferTransformer],
            // Statements
            [N.VariableAssignmentNode, variableAssignmentTransformer],
        ]);

        return SyntaxTreeToAstTransformer.transformers = transformers;
    }
}

interface NodeTransformer {
    (node: SyntaxTreeNodes.Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.Node
}

/**
 * Tests if the node's children match expected combination.
 */
function matchesCombination(node: SyntaxTreeNodes.Node, expected: typeof SyntaxTreeNodes.Node[]): boolean {
    if (node.children.length !== expected.length)
        return false;

    for (let i = 0; i < expected.length; i++) {
        if (!(node.children[i] instanceof expected[i]))
            return false;
    }
    return true;
}

function dummyTokenTransformer(): AstNodes.Node {
    return null;
}
function deferTransformer(node: SyntaxTreeNodes.Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.Node {
    if (node.children.length !== 1)
        throw new Error('Defering nodes should have exactly 1 child');
    return results.get(node.children[0]);
}
function numberTokenTransformer(node: SyntaxTreeNodes.NumberTokenNode): AstNodes.NumberNode {
    return new AstNodes.NumberNode(node.token.value);
}
function stringTokenTransformer(node: SyntaxTreeNodes.StringTokenNode): AstNodes.StringNode {
    return new AstNodes.StringNode(node.token.value);
}

function baseLevelBlockTransformer(node: SyntaxTreeNodes.BaseLevelBlockNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.BaseLevelBlockNode {
    if (node.children.length === 0) {
        return new AstNodes.BaseLevelBlockNode();
    }

    if (node.children.length !== 2)
        throw new Error('BaseLevelBlockNode\'s children did not match any known combination.');

    var inner: AstNodes.Node = results.get(node.children[0]);
    var block: AstNodes.BaseLevelBlockNode = <AstNodes.BaseLevelBlockNode> results.get(node.children[1]);

    block.addFront(inner);

    return block;
}

function blockTransformer(node: SyntaxTreeNodes.BlockNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.BlockNode {
    if (node.children.length === 0) {
        return new AstNodes.BlockNode();
    }

    if (node.children.length !== 2)

        if (matchesCombination(node, [SyntaxTreeNodes.LineEndNode, SyntaxTreeNodes.BlockNode])
            || matchesCombination(node, [SyntaxTreeNodes.DoBlockNode, SyntaxTreeNodes.BlockNode])
            || matchesCombination(node, [SyntaxTreeNodes.ForBlockNode, SyntaxTreeNodes.BlockNode])
            || matchesCombination(node, [SyntaxTreeNodes.IfBlockNode, SyntaxTreeNodes.BlockNode])) {
            var inner: AstNodes.Node = results.get(node.children[0]);
            var block: AstNodes.BlockNode = <AstNodes.BlockNode> results.get(node.children[1]);
            block.addFront(inner);
            return block;
        }


    if (matchesCombination(node, [SyntaxTreeNodes.StatementNode, SyntaxTreeNodes.LineEndNode, SyntaxTreeNodes.BlockNode])) {
        var inner: AstNodes.Node = results.get(node.children[0]);
        var block: AstNodes.BlockNode = <AstNodes.BlockNode> results.get(node.children[2]);
        block.addFront(inner);
        return block;
    }

    throw new Error('BlockNode\'s children did not match any known combination.');
}

function variableAssignmentTransformer() {
    return null;        // TODO
}

function initializerTransformer(node: SyntaxTreeNodes.InitializerNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    if (matchesCombination(node, [SyntaxTreeNodes.EqualTokenNode, SyntaxTreeNodes.ExpressionNode]))
        return results.get(node.children[1]);
    throw new Error('InitializerNode\'s children did not match any known combination.');
}

// Expressions
class BinaryExpressionChainNode extends AstNodes.ExpressionNode {
    private _terms: AstNodes.ExpressionNode[];
    private _types: typeof AstNodes.BinaryExpressionNode[];

    constructor() {
        super();
        this._terms = [];
        this._types = [];
    }

    addTerm(term: AstNodes.ExpressionNode, type: typeof AstNodes.BinaryExpressionNode): void {
        this._terms.push(term);
        this._types.push(type);
    }

    constructTree(leftmost: AstNodes.ExpressionNode): AstNodes.ExpressionNode {
        while (this._terms.length > 0) {
            var right = this._terms.pop();
            var type = this._types.pop();
            leftmost = new type(leftmost, right);
        }
        return leftmost;
    }
}

function expression7Transformer(node: SyntaxTreeNodes.Expression7Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Expression in parenthesis
    if (matchesCombination(node, [SyntaxTreeNodes.LeftParenthesisTokenNode, SyntaxTreeNodes.ExpressionNode, SyntaxTreeNodes.RightParenthesisTokenNode])) {
        return results.get(node.children[1]);
    }
    // Not expression
    if (matchesCombination(node, [SyntaxTreeNodes.NotTokenNode, SyntaxTreeNodes.Expression7Node])) {
        return new AstNodes.NotNode(results.get(node.children[1]));
    }
    // Negation
    if (matchesCombination(node, [SyntaxTreeNodes.NotTokenNode, SyntaxTreeNodes.Expression7Node])) {
        return new AstNodes.NegationNode(results.get(node.children[1]));
    }
    // Constant
    if (matchesCombination(node, [SyntaxTreeNodes.ConstantNode])) {
        return results.get(node.children[0]);
    }
    // Function call
    if (matchesCombination(node, [SyntaxTreeNodes.FunctionCallNode])) {
        return results.get(node.children[0]);
    }
    // Variable reference
    if (matchesCombination(node, [SyntaxTreeNodes.VariableReferenceNode])) {
        return results.get(node.children[0]);
    }

    throw new Error('Expression7Node\'s children did not match any known combination.');
}
function expression6ContinuationTransformer(node: SyntaxTreeNodes.Expression6ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Power
    if (matchesCombination(node, [SyntaxTreeNodes.PowerTokenNode, SyntaxTreeNodes.Expression7Node, SyntaxTreeNodes.Expression6ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.PowerNode;
    }

    if (!type)
        throw new Error('Expression6ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression5ContinuationTransformer(node: SyntaxTreeNodes.Expression5ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Multiplication
    if (matchesCombination(node, [SyntaxTreeNodes.MultiplicationTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression5ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.MultiplicationNode;
    }
    // Division
    if (matchesCombination(node, [SyntaxTreeNodes.DivisionTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression5ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.DivisionNode;
    }
    // Integer division
    if (matchesCombination(node, [SyntaxTreeNodes.IntegerDivisionTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression5ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.IntegerDivisionNode;
    }
    // Modulo
    if (matchesCombination(node, [SyntaxTreeNodes.ModTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression5ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.ModuloNode;
    }

    if (!type)
        throw new Error('Expression5ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression4ContinuationTransformer(node: SyntaxTreeNodes.Expression4ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Addition
    if (matchesCombination(node, [SyntaxTreeNodes.AdditionTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression4ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.AdditionNode;
    }
    // Substraction
    if (matchesCombination(node, [SyntaxTreeNodes.SubstractionTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression4ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.SubstractionNode;
    }

    if (!type)
        throw new Error('Expression4ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression3ContinuationTransformer(node: SyntaxTreeNodes.Expression3ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Concatenation
    if (matchesCombination(node, [SyntaxTreeNodes.ConcatenationTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression3ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.ConcatenationNode;
    }

    if (!type)
        throw new Error('Expression3ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression2ContinuationTransformer(node: SyntaxTreeNodes.Expression2ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Equal
    if (matchesCombination(node, [SyntaxTreeNodes.EqualTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.EqualNode;
    }
    // Not equal
    if (matchesCombination(node, [SyntaxTreeNodes.NotEqualTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.NotEqualNode;
    }
    // Less than
    if (matchesCombination(node, [SyntaxTreeNodes.LessThanTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.LessThanNode;
    }
    // Less or equal
    if (matchesCombination(node, [SyntaxTreeNodes.LessOrEqualTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.LessOrEqualNode;
    }
    // Greater than
    if (matchesCombination(node, [SyntaxTreeNodes.GreaterThanTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.GreaterThanNode;
    }
    // Greater or equal
    if (matchesCombination(node, [SyntaxTreeNodes.GreaterOrEqualTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression2ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.GreaterOrEqualNode;
    }

    if (!type)
        throw new Error('Expression2ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression1ContinuationTransformer(node: SyntaxTreeNodes.Expression1ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    // Empty
    if (node.children.length === 0)
        return null;

    var term: AstNodes.ExpressionNode = null;
    var chain: BinaryExpressionChainNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Or
    if (matchesCombination(node, [SyntaxTreeNodes.OrTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression1ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.OrNode;
    }
    // And
    if (matchesCombination(node, [SyntaxTreeNodes.AndTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression1ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.AndNode;
    }
    // Xor
    if (matchesCombination(node, [SyntaxTreeNodes.XorTokenNode, SyntaxTreeNodes.Expression6Node, SyntaxTreeNodes.Expression1ContinuationNode])) {
        term = results.get(node.children[1]);
        chain = <BinaryExpressionChainNode> results.get(node.children[2]);
        type = AstNodes.XorNode;
    }

    if (!type)
        throw new Error('Expression1ContinuationNode\'s children did not match any known combination.');

    if (!chain)
        chain = new BinaryExpressionChainNode();

    chain.addTerm(term, type);

    return chain;
}
function expression123456Transformer(node: SyntaxTreeNodes.Expression6Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.ExpressionNode {
    if (node.children.length !== 2)
        throw new Error('ExpressionNode\'s children did not match any known combination.');

    var left = results.get(node.children[0]);
    var chain = <BinaryExpressionChainNode> results.get(node.children[1]);

    if (!chain)
        chain = new BinaryExpressionChainNode();

    return chain.constructTree(left);
}

export = SyntaxTreeToAstTransformer;

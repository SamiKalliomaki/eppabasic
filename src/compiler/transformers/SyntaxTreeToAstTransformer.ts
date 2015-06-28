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
            // Defer nodes
            [N.StatementNode, deferTransformer],
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
    if(node.children.length === 0) {
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
    if(node.children.length === 0) {
        return new AstNodes.BlockNode();
    }

    if (node.children.length !== 2)
        throw new Error('BlockNode\'s children did not match any known combination.');

    var inner: AstNodes.Node = results.get(node.children[0]);
    var block: AstNodes.BlockNode = <AstNodes.BlockNode> results.get(node.children[1]);

    block.addFront(inner);

    return block;
}

function variableAssignmentTransformer() {
    return null;        // TODO
}

// Expressions
function expression7Transformer(node: SyntaxTreeNodes.Expression7Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.Node {
    // Expression in parenthesis
    if (node.children.length === 3
        && node.children[0] instanceof SyntaxTreeNodes.LeftParenthesisTokenNode
        && node.children[1] instanceof SyntaxTreeNodes.ExpressionNode
        && node.children[2] instanceof SyntaxTreeNodes.RightParenthesisTokenNode) {
        return results.get(node.children[1]);
    }
    // Not expression
    if (node.children.length === 2
        && node.children[0] instanceof SyntaxTreeNodes.NotTokenNode
        && node.children[1] instanceof SyntaxTreeNodes.Expression7Node) {
        return new AstNodes.NotNode(results.get(node.children[1]));
    }
    // Negation
    if (node.children.length === 2
        && node.children[0] instanceof SyntaxTreeNodes.NotTokenNode
        && node.children[1] instanceof SyntaxTreeNodes.Expression7Node) {
        return new AstNodes.NegationNode(results.get(node.children[1]));
    }
    // Constant
    if (node.children.length === 1
        && node.children[0] instanceof SyntaxTreeNodes.ConstantNode) {
        return results.get(node.children[0]);
    }
    // Function call
    if (node.children.length === 1
        && node.children[0] instanceof SyntaxTreeNodes.FunctionCallNode) {
        return results.get(node.children[0]);
    }
    // Variable reference
    if (node.children.length === 1
        && node.children[0] instanceof SyntaxTreeNodes.VariableReferenceNode) {
        return results.get(node.children[0]);
    }

    throw new Error('Expression7Node\'s children did not match any known combination.');
}
function expression6ContinuationTransformer(node: SyntaxTreeNodes.Expression6ContinuationNode, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.Node {
    // Empty
    if (node.children.length===0)
        return null;

    var right: AstNodes.ExpressionNode = null;
    var continuation: AstNodes.BinaryExpressionNode = null;
    var type: typeof AstNodes.BinaryExpressionNode = null;

    // Power
    if (node.children.length === 3
        && node.children[0] instanceof SyntaxTreeNodes.PowerTokenNode
        && node.children[1] instanceof SyntaxTreeNodes.Expression7Node
        && node.children[2] instanceof SyntaxTreeNodes.Expression6ContinuationNode) {
        right = results.get(node.children[1]);
        continuation = <AstNodes.BinaryExpressionNode> results.get(node.children[2]);
        type = AstNodes.PowerNode;
    }

    if (!type)
        throw new Error('Expression6ContinuationNode\'s children did not match any known combination.');

    if (continuation) {
        continuation.left = right;
        right = continuation;
    }

    return new type(null, right);
}
function expression123456Transformer(node: SyntaxTreeNodes.Expression6Node, results: Map<SyntaxTreeNodes.Node, AstNodes.Node>): AstNodes.Node {
    if (node.children.length !== 2)
        throw new Error('ExpressionNode\'s children did not match any known combination.');

    var left = results.get(node.children[0]);
    var continuation = <AstNodes.BinaryExpressionNode> results.get(node.children[1]);

    if (continuation) {
        continuation.left = left;
        return continuation;
    }
    return left;
}

export = SyntaxTreeToAstTransformer;

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

export = SyntaxTreeToAstTransformer;

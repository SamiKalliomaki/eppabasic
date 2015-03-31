import nodes = require('./nodes');

/*
 * Syntax tree
 */
class SyntaxTree
{
    /*
     * Root of the tree
     */
    private _root: nodes.Node;

    /*
     * @param root Root of the new tree
     */
    constructor(root: nodes.Node) {
        this._root = root;
    }

    /*
     * Returns the root of the tree
     */
    get root(): nodes.Node {
        return this._root;
    }
};

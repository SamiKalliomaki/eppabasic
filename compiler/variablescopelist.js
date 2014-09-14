define(['require', './nodes'], function (require) {
    var Nodes = require('./nodes');
    function VariableScopeList(ast) {
        this.changes = [];

        function fromAst(ast) {
            var changes = [];

            function visitBlock(block) {
                block.nodes.forEach(function each(node) {
                    if (typeof node === 'undefined')
                        return;                 // Skip undefined
                    switch (node.nodeType) {
                        case 'Block':
                            visitBlock(node);
                            break;
                        case 'DoLoop':
                            visitBlock(node.block);
                            break;
                        case 'If':
                            if (node.trueStatement)
                                visitBlock(node.trueStatement);
                            if (node.falseStatement)
                                if (node.falseStatement.nodeType === 'Block')
                                    visitBlock(node.falseStatement);
                            // Otherwise just a function call. If a variable definition, its scope is infinitesimal
                            break;
                        case 'For':
                            visitFor(node);
                            break;
                        case 'VariableDefinition':
                            addVariable(node.line, node.name);
                            break;
                    }
                });

                // Remove all defined varibles
                block.variables.forEach(function (variable) {
                    removeVariable(block.endLine, variable.name);
                });
            }
            function visitFor(loop) {
                addVariable(loop.line, loop.variable.name);
                visitBlock(loop.block);
                removeVariable(loop.endLine, loop.variable.name);
            }

            function addVariable(line, name) {
                if (!changes[line])
                    changes[line] = [];
                changes[line].push({ name: name, type: 'add' });
            }
            function removeVariable(line, name) {
                if (!changes[line - 1])
                    changes[line - 1] = [];
                changes[line - 1].push({ name: name, type: 'rem' });
            }

            visitBlock(ast);

            return changes;
        }

        if (ast && ast.nodeType === 'Block') {
            this.changes = fromAst(ast);
        }
        if (ast instanceof Array) {
            this.changes = ast;
        }
    }

    VariableScopeList.prototype = {
        getVariables: function getVariables(line) {
            var visibleVariables = [];
            for (var i in this.changes) {
                if (i >= line)
                    break;
                this.changes[i].forEach(function each(change) {
                    if (change.type === 'add') {
                        visibleVariables.push({ name: change.name, line: i });
                    } else if (change.type === 'rem') {
                        // Find out the last definition of variable
                        var last = visibleVariables.length;
                        while (last--) {
                            if (visibleVariables[last].name === change.name)
                                break;
                        }
                        // And remove it
                        visibleVariables.splice(last, 1);
                    }
                });
            }
            return visibleVariables;
        },
        toArray: function toArray() {
            return this.changes;
        }
    };

    return VariableScopeList;
});
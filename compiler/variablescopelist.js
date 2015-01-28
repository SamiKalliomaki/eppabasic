define(['require', './nodes'], function (require) {
    var Nodes = require('./nodes');
    function VariableScopeList(ast) {
        this.changes = [];

        function fromAst(ast) {
            var changes = [];

            function visitBlock(block) {
                var added = [];
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
                        case 'FunctionDefinition':
                            visitFunctionDefinition(node);
                            break;
                        case 'VariableDefinition':
                            addVariable(node.line, node.name);
                            added.push(node);
                            break;
                    }
                });

                // Remove all defined varibles
                added.forEach(function each(variable) {
                    removeVariable(block.endLine, variable.name);
                });
            }
            function visitFor(loop) {
                addVariable(loop.line, loop.variable.name);
                visitBlock(loop.block);
                removeVariable(loop.endLine, loop.variable.name);
            }
            function visitFunctionDefinition(definition) {
                definition.params.forEach(function each(param) {
                    addVariable(definition.line, param.name);
                });
                visitBlock(definition.block);
                definition.params.forEach(function each(param) {
                    removeVariable(definition.endLine, param.name);
                });
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
            /*console.log(this.changes.map(function (l, i) {
                if (l) {
                    return i + ': ' + l.map(function (c) {
                        return (c.type === 'add' ? '+' : '-') + c.name;
                    }).join();
                }
            }).filter(function (l) { return l; }).join('\n'));*/

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
                //console.log(i + ': ' + visibleVariables.map(function (v) { return v.name; }).join());
            }
            return visibleVariables;
        },
        toArray: function toArray() {
            return this.changes;
        }
    };

    return VariableScopeList;
});
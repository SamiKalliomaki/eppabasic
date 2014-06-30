/// <reference path="operators.js" />


function CompilerContext() {

}

function CompilerFunctionEntry() {

}

function Compiler(ast, operators) {
    /// <param name='operators' type='OperatorContainer' />
    this.ast = ast;
    this.operators = operators;

    this.functions = [];
}

Compiler.prototype = {
    defineFunction: function defineFunction(name, parameterTypes, returnType, entryName, atomic) {
        if (atomic !== false)
            atomic = true;
        var entry;
        if (!atomic) {
            // Non atomic function needs entry
            // Others can be without because they are called with their names
            entry = this.createEntry();
        }
    },
    defineJsFunction: function defineJsFunction() {
    },

    createEntry: function createEntry() {
        /// <returns type='CompilerFunctionEntry' />
    },


    findUserDefinedFunctions: function findUserDefinedFunctions() {
        this.ast.nodes.forEach(function each(def) {
            if (def.nodeType === 'FunctionDefinition') {
                throw new Error('User defined functions not supported yet');
            }
        }.bind(this));
    },

    // Actual code compilation
    compile: function compile() {
        this.findUserDefinedFunctions();

    }
};
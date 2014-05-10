/// <reference path="typechecker.js" />

function Compiler(ast) {
    this.ast = ast;
    this.functions = [];
    this.buf = [];

    // For variable locations
    this.variableLocations = {};
    this.nextFreeVariableLocation = 0;

    // For functions
    this.createdFunctions = {};
    this.nextFreeFunction = 0;
}

Compiler.prototype = {
    ftableName: '$fTable',
    fprefix: '$f',

    /*
     * Adds line to the buffer
     */
    buffer: function buffer(data) {
        this.buf.push(data);
    },

    /*
     * Defines a native function
     */
    defineJsFunction: function defineJsFunction(name, paramTypes, jsname, returnType, breaking) {
        if (breaking !== true)
            breaking = false;
        this.functions.push({
            name: name,
            paramTypes: paramTypes,
            jsname: jsname,
            returnType: returnType,
            breaking: breaking
        });
    },

    /*
     * Compiles ast tree into asm.js
     */
    compile: function compile() {
        // TODO: Find user defined functions
        this.typecheck();

        //this.buffer('function(stdlib, env, heap) {');
        //this.buffer('"use asm";');
        this.compileFunctions();

        // Heap access
        //this.buffer('var MEMS32 = new stdlib.Int32Array(heap);');
        //this.buffer('var MEMU32 = new stdlib.Uint32Array(heap);');

        //this.buffer('function init() {');
        this.visit(this.ast);
        //this.buffer('}');

        //this.buffer('}');

        return ('function Program(stdlib, env, heap) {\n'
                + '"use asm";\n'
                + 'var MEMS32 = new stdlib.Int32Array(heap);\n'
                + 'var MEMU32 = new stdlib.Uint32Array(heap);\n'
                + 'var MEMD64 = new stdlib.Float64Array(heap);\n'
                + 'var imul = stdlib.Math.imul;\n'
                + 'var SP = ' + this.nextFreeVariableLocation + ';\n'       // Stack pointer
                + this.buf.join('\n') + '\n'
                + this.createFTable()
                + '}'
            )

        this.buf.join('\n');
    },

    /*
     * Compiles functiondefinitions
     */
    compileFunctions: function compileFunctions() {
        var i = this.functions.length;
        while (i--) {
            var func = this.functions[i];
            if (func.jsname) {
                this.buffer('var ' + func.name + ' = env.' + func.jsname + ';');
            } else {
                throw new Error('User defined functions not supported yet');
            }
        }
    },

    /*
     * Visits an arbitrary node
     */
    visit: function visit(node, func) {
        if (!this['visit' + node.nodeType])
            throw new Error('Compiler can not compile "' + node.nodeType + '" nodes');
        this['visit' + node.nodeType](node, func);
    },

    /*
     * Visits a block. Basically just visits all children node.s
     */
    visitBlock: function visitBlock(block, func) {
        block.nodes.forEach(function each(val) {
            this.visit(val, func);
        }.bind(this));
    },

    /*
     * A dummy visit for comment node
     */
    visitComment: function visitComment(comment, func) { },

    /*
     * Visits a variable definition node
     */
    visitDefinition: function visitDefinition(definition, func) {
        var location = this.getFreeVariableLocation(definition.name, this.getTypeSize(definition.type));
        this.writeToTypedMemory(location,
            definition.initial ? definition.initial : 0,
            definition.type);

        // Save for later use
        definition.location = location;
    },

    /*
     * Visits a function call node
     */
    visitFunctionCall: function visitFunctionCall(call, func) {

    },

    visitFor:function visitFor() {

    },
    visitIf:function visitIf(){

    },

    /*
     * Returns evaluated expression as string
     */
    expr: function expr(expr) {
        if (typeof expr === 'number')
            return expr;                // A plain number

        switch (expr.nodeType) {
            case 'Number':
                return this.castTo(expr.val, expr.type);
            case 'BinaryOp':
                var left = this.expr(expr.left);
                var right = this.expr(expr.right);
                return this.castTo(left + ' ' + expr.op + ' ' + right, expr.type);
            case 'Variable':
                return this.castTo(this.readFromTypedMemory(
                        expr.definition.location,
                        expr.definition.type),
                    expr.type
                    );
        }

        throw new Error('Unsupported expression type "' + expr.nodeType + '"');
    },

    /*
     * Checks types of all variables and parameters
     */
    typecheck: function typecheck() {
        var checker = new Typechecker(this.ast, this.functions);
        checker.typecheck();
    },

    getTypeSize: function getTypeSize(type) {
        return 1 << this.getTypeShift(type);
    },
    getTypeShift: function getTypeShift(type) {
        switch (type) {
            case 'INTEGER':
                return 2;
            case 'DOUBLE':
                return 3;
        }
    },

    getFreeVariableLocation: function getFreeVariableLocation(name, size) {
        var res = this.nextFreeVariableLocation;
        this.nextFreeVariableLocation += size;
        this.variableLocations[name] = res;
        return res;
    },
    getVariableLocation: function getVariableLocation(name) {
        if (!this.variableLocations[name])
            throw new Error('No location allocated for variable "' + name + '"');
        return this.variableLocations[name];
    },

    getMemoryType: function getMemoryType(type) {
        switch (type) {
            case 'INTEGER':
                return 'MEMS32';
            case 'DOUBLE':
                return 'MEMD64';
        }
        throw new Error('Unsupported type "' + type + '"');
    },
    writeToTypedMemory: function writeToTypedMemory(location, expr, type) {
        var shift = this.getTypeShift(type);
        var mem = this.getMemoryType(type);

        this.buffer(mem + '[' + location + ' >> ' + shift + '] = ' + this.castTo(this.expr(expr), type) + ';');
    },
    readFromTypedMemory: function readFromTypedMemor(location,type) {
        var shift = this.getTypeShift(type);
        var mem = this.getMemoryType(type);
        return mem + '[' + location + ' >> ' + shift + ']';
    },

    castTo: function castTo(expr, type) {
        switch (type) {
            case 'INTEGER':
                return '((' + expr + ')|0)';
            case 'DOUBLE':
                return '+(' + expr + ')';
        }
        throw new Error('Unsupported type to cast into "' + type + '"');
    },

    createFTable: function createFTable() {
        return '';
    }
}
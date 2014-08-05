/// <reference path="lexer.js" />
/// <reference path="operators.js" />
/// <reference path="types.js" />
/// <reference path="nodes.js" />

function Parser(input, operators, types) {
    /// <param name='input' type='String' />
    /// <param name='operators' type='OperatorContainer' />
    /// <param name='types' type='TypeContainer' />
    this.lexer = new Lexer(input, true);
    this.operators = operators;
    this.types = types;
    this.errors = [];
}

Parser.prototype = {
    /*
     * Peeks n tokens in to the future
     */
    peek: function peek(n) {
        if (n === undefined)
            n = 1;
        return this.lexer.peek(n);
    },

    /*
     * Peeks tokens and finds the distance to the first node of specific type
     */
    peekDistance: function peekDistance(nodeType) {
        for (var i = 0; ; i++) {
            var node = this.peek(i + 1);

            if (node.type === nodeType) {
                return i;
            }
            if (node.type === 'eos') {
                return undefined;
            }
        }
    },

    /*
     * Peeks distance to matching right paren
     */
    peekDistanceToMatchingParen: function peekDistanceToMatchingParen(leftParen) {
        leftParen = leftParen || 1;

        var depth = 1;

        for (var i = leftParen; ; i++) {
            var node = this.peek(i + 1);

            if (node.type === 'eos') {
                return undefined;
            }

            if (node.type === 'lparen') {
                depth++;
            } else if (node.type === 'rparen') {
                depth--;
            }

            if (depth === 0) {
                return i;
            }
        }
    },

    /*
     * Advances lexer by one token
     */
    advance: function advane() {
        return this.lexer.advance();
    },
    /*
     * Advances lexer by one token if the first one is of specific type.
     * Otherwise throws an exception
     */
    expect: function expect(type) {
        var node = this.peek();

        if (node.type === type)
            return this.advance();

        while (this.peek().type !== 'eos' && this.peek().type !== 'newline') {
            this.advance();
        }

        if (this.peek().type !== 'newline') {
            this.advance();
        }

        throw new CompileError(node.line, 'Expected "' + type + '" but got "' + node.type + '"');
    },

    /*
     * Parses the whole input
     */
    parse: function parse() {
        var block = new Nodes.Block(0);
        while (this.peek().type !== 'eos') {
            var next = this.peek();
            if (next.type === 'newline') {
                this.advance();
                continue;
            }

            try {
                block.nodes.push(this.parseBaselevelStatement());
            } catch (e) {
                if (e instanceof CompileError) {
                    this.errors.push(e);
                } else {
                    throw e;
                }
            }

            // Comment can be at the end of a line
            if (this.peek().type === 'comment') {
                block.nodes.push(this.parseComment());
            }
            if (this.peek().type === 'eos')
                break;

            try {
                this.expect('newline');     // Expect newline after every statement
            } catch (e) {
                if (e instanceof CompileError) {
                    this.errors.push(e);
                } else {
                    throw e;
                }
            }
        }

        return block;
    },

    /*
     * Parses a base level statement.
     * 
     * A base level statement can contain function definitions.
     */
    parseBaselevelStatement: function parseBaselevelStatement() {
        switch (this.peek().type) {
            case 'function':
                return this.parseFunctionDefinition();
            case 'sub':
                return this.parseSubDefinition();
            default:
                return this.parseStatement();
        }
    },

    /*
     * Parses statement.
     * 
     * Statement can also be inside a block, so it can not contain function definitions.
     */
    parseStatement: function parseStatement() {
        try {
            switch (this.peek().type) {
                case 'comment':
                    return this.parseComment();
                case 'dim':
                    return this.parseVariableDefinition();
                case 'for':
                    return this.parseFor();
                case 'identifier':
                    return this.parseIdentifier();
                case 'if':
                    return this.parseIf();
                case 'do':
                    return this.parseDoLoop();
                case 'return':
                    return this.parseReturn();
                default:
                    throw new CompileError(this.peek().line, 'Unexpected token "' + this.peek().type + '"');
            }
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }
    },

    /*
     * Parses a range from the source.
     * ie. 0 TO 10
     */
    parseRange: function parseRange() {
        var start = this.parseExpr();
        this.expect('to');
        var end = this.parseExpr();
        return new Nodes.Range(start, end, start.line);
    },

    /*
     * Parse block
     */
    parseBlock: function parseBlock() {
        var block = new Nodes.Block(this.peek().line);

        // Comment can be at the end of the last
        if (this.peek().type === 'comment') {
            block.nodes.push(this.parseComment());
        }

        try {
            this.expect('newline');
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        while (this.peek().type !== 'eos') {
            if (this.peek().type === 'newline') {
                this.advance();
                continue;
            }
            switch (this.peek().type) {
                case 'next':
                case 'else':
                case 'elseif':
                case 'endif':
                case 'endfunction':
                case 'endsub':
                case 'loop':
                    return block;
            }
            block.nodes.push(this.parseStatement());

            // Comment can be at the end of a line
            if (this.peek().type === 'comment') {
                block.nodes.push(this.parseComment());
            }

            try {
                this.expect('newline');     // Expect newline after every statement
            } catch (e) {
                if (e instanceof CompileError) {
                    this.errors.push(e);
                } else {
                    throw e;
                }
            }
        }

        return block;
    },

    /*
     * Parses a for statement
     */
    parseFor: function parseFor() {
        var line = this.expect('for').line;

        var variable;
        var start;
        var stop;
        var step;

        try {
            variable = new Nodes.VariableDefinition(this.expect('identifier').val, line);
            this.expect('eq');
            start = this.parseExpr();
            this.expect('to');
            stop = this.parseExpr();
            step = new Nodes.Number('1', line);
            if (this.peek().type === 'step') {
                this.advance();
                step = this.parseExpr();
            }
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        var block = this.parseBlock();

        try {
            var nextLine = this.expect('next').line;
            if (variable && variable.name !== this.expect('identifier').val)
                throw new CompileError(nextLine, 'Next statement must have same variable as the original for statement');
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        return new Nodes.For(variable, block, start, stop, step, line);
    },
    /*
     * Parses an if statement
     */
    parseIf: function parseIf() {
        var expr;

        try {
            this.expect('if');
            expr = this.parseExpr();
            this.expect('then');
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        var trueStatement = this.parseBlock();
        var res = new Nodes.If(expr, trueStatement, undefined, expr && expr.line);
        var cur = res;

        while (this.peek().type !== 'endif') {
            if (this.peek().type === 'else') {
                this.advance();
                cur.falseStatement = this.parseBlock();
                break;
            } else if (this.peek().type === 'elseif') {
                this.advance();
                try {
                    expr = this.parseExpr();
                    this.expect('then');
                } catch (e) {
                    if (e instanceof CompileError) {
                        this.errors.push(e);
                    } else {
                        throw e;
                    }
                }
                trueStatement = this.parseBlock();
                cur = cur.falseStatement = new Nodes.If(expr, trueStatement, undefined, expr.line);
            } else {
                this.expect('else/elseif/endif');           // Throws an error with appropriate error message
            }
        }
        this.expect('endif');

        return res;
    },

    /*
     * Parses an identifier from the statement
     * Can be either function call or assignment
     */
    parseIdentifier: function parseIdentifier() {
        var tok = this.expect('identifier');

        if (this.peek().type === 'eq' || this.peek().type === 'lbracket') {
            var dimensions;
            if (this.peek().type === 'lbracket') {
                dimensions = this.parseDimensions();
            }
            this.expect('eq');
            var expr = this.parseExpr();
            return new Nodes.VariableAssignment(tok.val, expr, dimensions, tok.line);
        } else {
            var params = this.parseParams(false);
            tok.isFunctionCall = true;
            return new Nodes.FunctionCall(tok.val, params, tok.line);
        }
    },
    /*
     * Parses function/sub call parameters
     */
    parseParams: function parseParams(hasParens) {
        var params = [];
        if (hasParens !== true)
            hasParens = false;
        if (this.peek().type === 'lparen' && (this.peek(2).type === 'rparen' || this.peekDistance('comma') < this.peekDistanceToMatchingParen())) {
            hasParens = true;
        }
        if (hasParens)
            this.expect('lparen');

        while (this.peek().type !== 'newline'
            && this.peek().type !== 'rparen'
            && this.peek().type !== 'eos'
            && this.peek().type !== 'comment') {

            params.push(this.parseExpr());

            if (this.peek().type !== 'comma')
                break;
            this.expect('comma');
        }

        if (hasParens)
            this.expect('rparen');

        return params;
    },
    /*
     * Parses a variable definition
     */
    parseVariableDefinition: function parseVariableDefinition() {
        var line = this.expect('dim').line;
        var name = this.expect('identifier').val;
        var type;
        var initial;
        var dimensions;
        if (this.peek().type === 'lbracket') {
            dimensions = this.parseDimensions();
        }
        if (this.peek().type === 'as') {
            this.advance();
            var typeTok = this.expect('identifier');
            typeTok.isType = true;
            type = this.types.getTypeByName(typeTok.val);
            if (!type)
                this.errors.push(new CompileError(line, 'errors.type-undefined', {type: typeTok.val}));
        }
        if (this.peek().type === 'eq') {
            this.advance();
            initial = this.parseExpr();
        }
        if (dimensions)
            type = this.types.getArrayType(type, dimensions.length);
        return new Nodes.VariableDefinition(name, type, initial, dimensions, line);
    },

    /*
     * Parses a parameter list
     */
    parseParameterList: function parseParameterList() {
        var params = [];

        // Parse parameter list
        var line = this.expect('lparen').line;
        paramloop: while (this.peek().type !== 'rparen') {
            var paramname = this.expect('identifier').val;
            this.expect('as');
            var typeTok = this.expect('identifier');
            typeTok.isType = true;
            var paramtype = this.types.getTypeByName(typeTok.val);
            if (!paramtype)
                this.errors.push(new CompileError(line, 'errors.type-undefined', {type: typeTok.val}));


            params.push({
                name: paramname,
                type: paramtype
            });

            switch (this.peek().type) {
                case 'comma':
                    this.advance();
                    break;
                case 'rparen':
                    break paramloop;
                default:
                    this.expect('comma');
            }
        }
        this.expect('rparen');

        return params;
    },

    /*
     * Parses a function definition
     */
    parseFunctionDefinition: function parseFunctionDefinition() {
        var line;
        var name;
        var params;
        var type;

        try {
            line = this.expect('function').line;
            name = this.expect('identifier').val;
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        try {
            params = this.parseParameterList();
            this.expect('as');
            var typeTok = this.expect('identifier');
            typeTok.isType = true;
            type = this.types.getTypeByName(typeTok.val);
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        var block = this.parseBlock();

        try {
            this.expect('endfunction');
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        return new Nodes.FunctionDefinition(name, params, type, block, line);
    },
    /*
     * Parses a return statement
     */
    parseReturn: function parseReturn(ret, parent) {
        var line = this.expect('return').line;
        if (this.peek().type !== 'newline' && this.peek().type !== 'eos')
            return new Nodes.Return(this.parseExpr(), line);
        else
            return new Nodes.Return(undefined, line);
    },

    /*
     * Parses a subprogram definition
     */
    parseSubDefinition: function parseSubDefinition() {
        var line;
        var name;
        var params = [];

        try {
            line = this.expect('sub').line;
            name = this.expect('identifier').val;
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        try {
            params = this.parseParameterList();
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        var block = this.parseBlock();

        try {
            this.expect('endsub');
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }
        return new Nodes.FunctionDefinition(name, params, undefined, block, line);
    },

    /*
     * Parses a do-loop statement statement
     */
    parseDoLoop: function parseDoLoop() {
        var line = this.expect('do').line;

        try {
            if (this.peek().type === 'while' || this.peek().type === 'until') {
                var until = this.advance().type === 'until';
                var beginCondition = this.parseExpr();
                if (until)
                    beginCondition = new Nodes.UnaryOp('not', beginCondition, beginCondition.line);
            }
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        var block = this.parseBlock();

        try {
            this.expect('loop');
            if (this.peek().type === 'while' || this.peek().type === 'until') {
                var until = this.advance().type === 'until';
                var endCondition = this.parseExpr();
                if (until)
                    endCondition = new Nodes.UnaryOp('not', endCondition, endCondition.line);
            }
        } catch (e) {
            if (e instanceof CompileError) {
                this.errors.push(e);
            } else {
                throw e;
            }
        }

        return new Nodes.DoLoop(beginCondition, endCondition, block, line);
    },

    /*
     * Parses an expression (ie. 1+2, x*3, 2<1 AND 2<3)
     */
    parseExpr: function parseExpr(level) {
        if (!level)
            level = 0;
        var tokens = this.operators.getTokensByPriority(level);
        if (!tokens) {
            // No operators at this level any more -> let's parse whats left
            var t = this.advance();

            // Test if it is an expression in parenthesis
            if (t.type === 'lparen') {
                var e = this.parseExpr();
                this.expect('rparen');
                return e;
            }

            switch (t.type) {
                // TODO Move unary operators away from parseExpr
                case 'minus':
                    return new Nodes.UnaryOp('minus', this.parseExpr(level), t.line);
                case 'not':
                    return new Nodes.UnaryOp('not', this.parseExpr(0), t.line);

                case 'number':
                    return new Nodes.Number(t.val, t.line);
                case 'string':
                    return new Nodes.String(t.val, t.line);
                case 'identifier':
                    // An identifier! Then it must be either function call or variable
                    var node;
                    if (this.peek().type === 'lparen') {
                        // It's function call!
                        t.isFunctionCall = true;
                        var params = this.parseParams(true);
                        var node = new Nodes.FunctionCall(t.val, params, t.line);
                    } else {
                        // Ok, it's just variable
                        node = new Nodes.Variable(t.val, t.line);
                    }
                    // If it is an array, get the returned item
                    if (this.peek().type === 'lbracket')
                        node = new Nodes.IndexOp(node, this.parseDimensions(), this.peek().line);
                    return node;
                    break;
                default:
                    throw new CompileError(t.line, 'Number or variable expected instead of "' + t.type + '"');
            }
        }

        // Ok, we have a list of tokens.
        // First parse the first operand
        var left = this.parseExpr(level + 1);
        do {
            // Then test if we have right kind of token awaiting
            var opType = this.peek().type;
            var tokenType = tokens.find(function find(token) {
                return token == opType;
            });

            if (!tokenType) {
                // Ok, we are out of right kind of tokens
                // Just return what we have
                return left;
            }

            // Take operator token for later use
            var op = this.expect(tokenType);

            // Then last but not least parse the next operand of the expression
            var right = this.parseExpr(level + 1);

            left = new Nodes.BinaryOp(left, tokenType, right, op.line);
        } while (tokens.chainable);
        // Ok, this level of operators was not chainable
        // Just be quiet and give out what we got
        return left;
    },

    parseDimensions: function parseDimensions() {
        var dims = [];
        this.expect('lbracket');
        while (1) {
            dims.push(this.parseExpr());
            if (this.peek().type === 'rbracket')
                break;
            this.expect('comma');
        }
        this.expect('rbracket');
        return dims;
    },

    /*
     * Parses a comment
     */
    parseComment: function parseComment() {
        var tok = this.expect('comment');
        return new Nodes.Comment(tok.val, tok.line);
    }
};

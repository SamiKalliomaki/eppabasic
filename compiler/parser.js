/// <reference path="lexer.js" />
/// <reference path="operators.js" />
/// <reference path="nodes.js" />

function Parser(input, operators) {
    /// <param name='input' type='String' />
    /// <param name='operators' type='OperatorContainer' />
    this.lexer = new Lexer(input);
    this.operators = operators;
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
        if (this.peek().type === type)
            return this.advance();
        throw new Error('Expected "' + type + '" but got "' + this.peek().type + '" at line ' + this.peek().line);
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
            block.nodes.push(this.parseBaselevelStatement());

            // Comment can be at the end of a line
            if (this.peek().type === 'comment') {
                block.nodes.push(this.parseComment());
            }
            if (this.peek().type === 'eos')
                break;
            this.expect('newline');     // Expect newline after every statement
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
            case 'comment':
                return this.parseComment();
            case 'dim':
                return this.parseVariableDefinition();
            case 'for':
                return this.parseFor();
            case 'function':
                return this.parseFunctionDefinition();
            case 'identifier':
                return this.parseIdentifier();
            case 'if':
                return this.parseIf();
            case 'repeat':
                return this.parseRepeat();
            case 'sub':
                return this.parseSubDefinition();
            default:
                throw new Error('Unexpected token "' + this.peek().type + '" at line ' + this.peek().line);
        }
    },

    /*
     * Parses statement.
     * 
     * Statement can also be inside a block, so it can not contain function definitions.
     */
    parseStatement: function parseStatement() {
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
            case 'repeat':
                return this.parseRepeat();
            case 'return':
                return this.parseReturn();
            default:
                throw new Error('Unexpected token "' + this.peek().type + '" at line ' + this.peek().line);
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
        this.expect('newline');

        while (1) {
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
                case 'forever':
                case 'until':
                case 'while':
                    return block;
            }
            block.nodes.push(this.parseStatement());

            // Comment can be at the end of a line
            if (this.peek().type === 'comment') {
                block.nodes.push(this.parseComment());
            }
            this.expect('newline');     // Expect newline after every statement
        }
    },

    /*
     * Parses a for statement
     */
    parseFor: function parseFor() {
        var line = this.expect('for').line;

        var variable = new Nodes.VariableDefinition(this.expect('identifier').val, line);
        this.expect('eq');
        var start = this.parseExpr();
        this.expect('to');
        var stop = this.parseExpr();
        var step = new Nodes.Number('1', line);
        if (this.peek().type === 'step') {
            this.advance();
            step = this.parseExpr();
        }

        var block = this.parseBlock();

        this.expect('next');
        if (variable.name !== this.expect('identifier').val)
            throw new Error('Next statement must have same variable as the original for statement');

        return new Nodes.For(variable, block, start, stop, step, line);
    },
    /*
     * Parses an if statement
     */
    parseIf: function parseIf() {
        this.expect('if');

        var expr = this.parseExpr()
        this.expect('then');
        var trueStatement = this.parseBlock();
        var res = new Nodes.If(expr, trueStatement, expr.line);
        var cur = res;

        while (this.peek().type !== 'endif') {
            if (this.peek().type === 'else') {
                this.advance();
                cur.falseStatement = this.parseBlock();
                break;
            } else if (this.peek().type === 'elseif') {
                this.advance();
                expr = this.parseExpr();
                this.expect('then');
                trueStatement = this.parseBlock();
                cur = cur.falseStatement = new Nodes.If(expr, trueStatement, expr.line);
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
            var params = this.parseParams();
            return new Nodes.FunctionCall(tok.val, params, tok.line);
        }
    },
    /*
     * Parses function/sub call parameters
     */
    parseParams: function parseParams() {
        var params = [];
        var hasParens = false;
        if (this.peek().type === 'lparen') {
            this.advance();
            hasParens = true;
        }

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
            type = Types.toType(this.expect('identifier').val);
        }
        if (this.peek().type === 'eq') {
            this.advance();
            initial = this.parseExpr();
        }
        return new Nodes.VariableDefinition(name, type, initial, dimensions, line);
    },

    /*
     * Parses a function definition
     */
    parseFunctionDefinition: function parseFunctionDefinition() {
        var line = this.expect('function').line;
        var name = this.expect('identifier').val;
        var params = [];

        // Parse parameter list
        this.expect('lparen');
        paramloop: while (this.peek().type !== 'rparen') {
            var paramname = this.expect('identifier').val;
            this.expect('as');
            var paramtype = Types.toType(this.expect('identifier').val);

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
        this.expect('as');
        var type = Types.toType(this.expect('identifier').val);

        var block = this.parseBlock();

        this.expect('endfunction');

        return new Nodes.FunctionDefinition(name, params, type, block, line);
    },
    /*
     * Parses a return statement
     */
    parseReturn: function parseReturn(ret, parent) {
        var line = this.expect('return').line;
        return new Nodes.Return(this.parseExpr(), line);
    },

    /*
     * Parses a subprogram definition
     */
    parseSubDefinition: function parseSubDefinition() {
        var line = this.expect('sub').line;
        var name = this.expect('identifier').val;
        var params = [];

        // Parse parameter list
        this.expect('lparen');
        paramloop: while (this.peek().type !== 'rparen') {
            var paramname = this.expect('identifier').val;
            this.expect('as');
            var paramtype = Types.toType(this.expect('identifier').val);

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

        var block = this.parseBlock();

        this.expect('endsub');

        return new Nodes.FunctionDefinition(name, params, undefined, block, line);
    },

    /*
     * Parses an repeat-forever/until/while statement
     */
    parseRepeat: function parseRepeat() {
        var line = this.expect('repeat').line;

        var block = this.parseBlock();

        switch (this.peek().type) {
            case 'forever':
                this.advance();
                return new Nodes.RepeatForever(block, line);
            case 'until':
                this.advance();
                var expr = this.parseExpr();
                return new Nodes.RepeatUntil(block, expr, line);
            case 'while':
                this.advance();
                var expr = this.parseExpr();
                return new Nodes.RepeatWhile(block, expr, line);
            default:
                this.expect('forever/until/while');
        }
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
                    return new Nodes.UnaryOp('neg', this.parseExpr(level), t.line);
                case 'number':
                    return new Nodes.Number(t.val, t.line);
                case 'string':
                    return new Nodes.String(t.val, t.line);
                case 'identifier':
                    // An identifier! Then it must be either function call or variable
                    var node;
                    if (this.peek().type === 'lparen') {
                        // It's function call!
                        var params = this.parseParams();
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
                    throw new Error('Number or variable expected instead of "' + t.type + '" at line ' + t.line);
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
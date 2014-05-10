/// <reference path="lexer.js" />
/// <reference path="nodes.js" />

function Parser(input) {
    this.lexer = new Lexer(input);
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
        var block = new Nodes.Block();
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
            case 'dim':
                return this.parseDefinition();
            case 'identifier':
                return this.parseIdentifier();
            case 'if':
                return this.parseIf();
            case 'for':
                return this.parseFor();
            case 'comment':
                return this.parseComment();
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
            case 'dim':
                return this.parseDefinition();
            case 'identifier':
                return this.parseIdentifier();
            case 'if':
                return this.parseIf();
            case 'for':
                return this.parseFor();
            case 'comment':
                return this.parseComment();
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
        return new Nodes.Range(start, end);
    },

    /*
     * Parse block
     */
    parseBlock: function parseBlock() {
        var block = new Nodes.Block();

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
            switch(this.peek().type) {
                case 'next':
                case 'else':
                case 'elseif':
                case 'endif':
                    return block;
            }
            block.nodes.push(this.parseStatement());
            
            // Comment can be at the end of a line
            if (this.peek().type === 'comment') {
                block.nodes.push(this.parseComment());
            }
            this.expect('newline');     // Expect newline after every statement
            //do {
            //    this.expect('newline');
            //} while (this.peek().type === 'newline')
        }
    },

    /*
     * Parses a for statement
     */
    parseFor: function parseFor() {
        this.expect('for');

        var variable = new Nodes.Definition(this.expect('identifier').val);
        //if (this.peek().type !== 'binop' || this.peek().val !== '=')
        //    throw new Error('For statement must have an equal siqn before range');
        this.expect('eq');
        var range = this.parseRange();
        var block = this.parseBlock();

        this.expect('next');
        if (variable.name !== this.expect('identifier').val)
            throw new Error('Next statement must have same variable as the original for statement');

        return new Nodes.For(variable, range, block);
    },
    /*
     * Parses an if statement
     */
    parseIf: function parseIf() {
        this.expect('if');

        var expr = this.parseExpr()
        this.expect('then');
        var trueStatement = this.parseBlock();
        var res = new Nodes.If(expr, trueStatement);
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
                cur = cur.falseStatement = new Nodes.If(expr, trueStatement);
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

        if (this.peek(2).type === 'eq') {
            throw new Error('Variable assignments not yet supported');
        } else {
            var params = this.parseParams();
            return new Nodes.FunctionCall(tok.val, params);
            //throw new Error('Function calls not yet supported');
            throw new Error('Unexpected token "identifier" at line ' + this.peek().line);
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
            && this.peek().type !== 'eos') {

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
    parseDefinition: function parseDefinition() {
        this.expect('dim');
        var name = this.expect('identifier').val;
        var type;
        var initial;
        if (this.peek().type === 'as') {
            this.advance();
            type = this.expect('identifier').val;
        }
        if (this.peek().type === 'eq') {
            this.advance();
            initial = this.parseExpr();
        }
        return new Nodes.Definition(name, type, initial);
    },

    /*
     * Parses an expression (ie. 1+2, x*3, 2<1 AND 2<3)
     */
    parseExpr: function parseExpr() {
        var left = this.parseMathExpr();
        switch (this.peek().type) {
            case 'eq':
            case 'lt':
            case 'lte':
            case 'gt':
            case 'gte':
                var op = this.advance();
                var right = this.parseMathExpr();
                return new Nodes.BinaryOp(left, op.val, right);
        }
        return left;
    },
    parseMathExpr: function parseMathExpr() {
        var left = this.parseTerm();
        while (1) {
            switch (this.peek().type) {
                case 'plus':
                case 'minus':
                    var op = this.advance();
                    var right = this.parseTerm();
                    left = new Nodes.BinaryOp(left, op.val, right);
                    break;
                default:
                    return left;
            }
        }
    },
    parseTerm: function parseTerm() {
        var left = this.parseFactor();
        while (1) {
            switch (this.peek().type) {
                case 'mul':
                case 'div':
                case 'mod':
                    var op = this.advance();
                    var right = this.parseFactor();
                    left = new Nodes.BinaryOp(left, op.val, right);
                    break;
                default:
                    return left;
            }
        }
    },
    parseFactor: function parseFactor() {
        var t = this.advance();
        if (t.type === 'lparen') {
            var e = this.parseExpr();
            this.expect('rparen');
            return e;
        }

        switch (t.type) {
            case 'minus':
                return new Nodes.UnaryOp('-', this.parseFactor());
            case 'number':
                return new Nodes.Number(t.val);
            case 'identifier':
                if (this.peek().type === 'lparen') {
                    // A function call
                    var params = this.parseParams();
                    return new Nodes.FunctionCall(t.val, params);
                }
                return new Nodes.Variable(t.val);
                break;
            default:
                throw new Error('Number or variable expected instead of "' + t.type + '" at line ' + t.line);
        }
    },

    /*
     * Parses a comment
     */
    parseComment: function parseComment() {
        var tok = this.expect('comment');
        return new Nodes.Comment(tok.val);
    }
};
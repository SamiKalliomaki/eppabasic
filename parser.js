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
        throw new Error('Expected "' + type + '" but got "' + this.peek().type + '"');
    },

    /*
     * Parses the whole input
     */
    parse: function parse() {
        while (this.peek().type !== 'eos') {
            var next = this.peek();
            var expr = this.parseBaselevelStatement();
        }
    },

    /*
     * Parses a base level statement.
     * 
     * A base level statement can contain function definitions.
     */
    parseBaselevelStatement: function parseBaselevelStatement() {
        switch (this.peek().type) {
            case "for":
                return this.parseFor();
            default:
                throw new Error('Unexpected token "' + this.peek().type + '"');
        }
    },

    /*
     * Parses statement.
     * 
     * Statement can also be inside a block, so it can not contain function definitions.
     */
    parseStatement: function parseStatement() {
        switch (this.peek().type) {
            case "for":
                return this.parseFor();
            default:
                throw new Error('Unexpected token "' + this.peek().type + '"');
        }
    },

    /*
     * Parses a for statement
     */
    parseFor: function parseFor() {
        var tok = this.expect('for');

        var variable = this.expect('identifier');
        //if (this.peek().type !== 'binop' || this.peek().val !== '=')
        //    throw new Error('For statement must have an equal siqn before range');
        this.expect('eq');
        var range = this.parseRange();
        var block = this.parseBlock();
        
        this.expect('next');
        if (variable.val !== this.expect('identifier').val)
            throw new Error('Next statement must have same variable as the original for statement');

        return new Nodes.For(variable, range, block);
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
        do {
            this.expect('newline');
        } while (this.peek().type === 'newline')
        var block = new Nodes.Block();
        while (1) {
            switch(this.peek().type) {
                case 'next':
                case 'endif':
                    return block;
            }
            block.nodes.push(this.parseStatement());
            do {
                this.expect('newline');
            } while (this.peek().type === 'newline')
        }
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
                return new Nodes.BinaryOp(left, op.val, rigth);
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
                    left = new Nodes.BinrayOp(left, op.val, right);
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
                    left = new Nodes.BinrayOp(left, op.val, right);
                    break;
                default:
                    return left;
            }
        }
    },
    parseFactor: function parseFactor() {
        var t = this.advance();
        if (t === 'lparen') {
            var e = this.parseExpr();
            this.expect('rparen');
            return e;
        }

        switch (t.type) {
            case 'minus':
                return new Nodes.UnaryOp('-', this.parseFactor());
            case 'number':
                return new Nodes.Number(t.val);
            default:
                throw new Error('Number or variable expected instead of "' + t.type + '"');
        }
    }
};
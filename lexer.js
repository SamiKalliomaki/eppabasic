function Lexer(input) {
    this.input = input || "";
    this.stash = [];
}

Lexer.prototype = {
    /*
     * Creates a generic token with specific type and value
     */
    tok: function tok(type, val) {
        return {
            type: type,
            val: val
        };
    },
    /*
     * Consumes len characters from the input
     */
    consume: function consume(len) {
        this.input = this.input.substr(len);
    },
    /*
     * Peeks n:th token from the input
     */
    peek: function peek(n) {
        var fetch = n - this.stash.length;
        while (fetch-- > 0) this.stash.push(this.next());
        return this.stash[--n];
    },
    /*
     * Gets next token from the top of the stash if it exists
     */
    stashed: function stashed() {
        return this.stash.length
            && this.stash.shift();
    },
    /*
     * Returns and removes the next token
     */
    advance: function advance() {
        return this.stashed()
            || this.next();
    },

    /*
     * Parses next token from the input
     */
    next: function next() {
        return null
            || this.eosToken()
            || this.opToken()
            || this.parenthesisToken()
            || this.toToken()
            || this.forToken()
            || this.nextToken()
            || this.identifierToken()
            || this.numberToken()
            || this.newlineToken()
            || this.fail();
    },

    /*
     * Parses end-of-source token
     */
    eosToken: function eosToken() {
        if (this.input.length)
            return;
        return this.tok('eos');
    },

    /*
     * Parses an op (ie. =, <, >, +, -, *, /, AND, OR, XOR, MOD) token
     */
    opToken: function opToken() {
        var captures;
        if (captures = /^ *(<=?|>=?|=|\+|-|\*|\/|MOD|AND|OR|XOR)/i.exec(this.input)) {
            this.consume(captures[0].length);
            var map = {
                '<': 'lt',
                '<=': 'lte',
                '>': 'gt',
                '>=': 'gte',
                '=': 'eq',

                'and': 'and',
                'or': 'or',
                'xor': 'xor',

                '+': 'plus',
                '-': 'minus',
                '*': 'mul',
                '/': 'div',
                'mod': 'mod',
            };
            return this.tok(map[captures[1].toLowerCase()], captures[1].toLowerCase());
        }
    },
    /*
     * Parses parenthesis (ie. '(' and  ')') from the input
     */
    parenthesisToken: function parenthesisToken() {
        var captures;
        if (captures = /^ *(\(|\))/i.exec(this.input)) {
            this.consume(captures[0].length);
            var map = {
                '(': 'lparen',
                ')': 'rparen',
            };
            return this.tok(map[captures[1].toLower()]);
        }
    },
    /*
     * Parses a "TO" token from the input
     */
    toToken: function toToken() {
        var captures;
        if (captures = /^ *(TO)/i.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('to', captures[1]);
        }
    },

    /*
     * Parses a identifier (ie. variable names) token
     */
    identifierToken: function ideintifierToken() {
        var captures;
        if (captures = /^ *([A-Za-z][-_\w]*)/.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('identifier', captures[1]);
        }
    },
    /*
     * Parses a number from the input
     */
    numberToken:function numberToken() {
        var captures;
        if (captures = /^ *(\d*\.?\d+)/.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('number', captures[1]);
        }
    },
    /*
     * Parses a newline from the input
     */
    newlineToken: function newlineToken() {
        var captures;
        if (captures = /^ *\n/.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('newline');
        }
    },

    /*
     * Parses for token
     */
    forToken: function forToken() {
        var captures;
        if (captures = /^FOR /i.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('for');
            //tok.variable = parseIdentifier();
            //if (!(captures = /^ *= */i.exec(this.input))) {
            //    throw new Error('For loop must be in form FOR identifier = range');
            //}
            //tok.range = parseRange();
        }
    },
    /*
     * Parses a "NEWX" token from the input
     */
    nextToken: function nextToken() {
        var captures;
        if (captures = /^ *(NEXT)/i.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok('next', captures[1]);
        }
    },

    /*
     * Indicates failure in the lexer
     */
    fail: function fail() {
        throw new Error('Unexpected text: "' + this.input.substr(0, 10) + '"');
    }
};
﻿function Lexer(input) {
    this.input = input.trim() || "";
    this.stash = [];
    this.lineno = 1;
}

Lexer.prototype = {
    /*
     * Creates a generic token with specific type and value
     */
    tok: function tok(type, val) {
        return {
            type: type,
            line: this.lineno,
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
     * Scans input for tokens specified by regex
     */
    scan: function scan(regex, type) {
        var captures;
        if (captures = regex.exec(this.input)) {
            this.consume(captures[0].length);
            return this.tok(type, captures[1]);
        }
    },

    /*
     * Parses next token from the input
     */
    next: function next() {
        return null
            || this.eosToken()
            || this.commentToken()
            || this.opToken()
            || this.parenthesisToken()
            || this.toToken()

            || this.forToken()
            || this.nextToken()

            || this.ifToken()
            || this.thenToken()
            || this.elseIfToken()
            || this.elseToken()
            || this.endIfToken()

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
     * Parses a comment token from the input
     */
    commentToken: function commentToken() {
        return this.scan(/^ *'([^\n]*)/, 'comment');
    },

    /*
     * Parses an op (ie. =, <, >, +, -, *, /, AND, OR, XOR, MOD) token
     */
    opToken: function opToken() {
        var captures;
        if (captures = /^ *(<=?|>=?|=|\+|-|\*|\/|MOD\b|AND\b|OR\b|XOR\b)/i.exec(this.input)) {
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
            return this.tok(map[captures[1].toLowerCase()]);
        }
    },
    /*
     * Parses a "TO" token from the input
     */
    toToken: function toToken() {
        return this.scan(/^ *(TO)\b/i, 'to');
        //var captures;
        //if (captures = /^ *(TO)/i.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('to', captures[1]);
        //}
    },

    /*
     * Parses a identifier (ie. variable names) token
     */
    identifierToken: function ideintifierToken() {
        return this.scan(/^ *([A-Za-z][-_\w]*)/, 'identifier');
        //var captures;
        //if (captures = /^ *([A-Za-z][-_\w]*)/.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('identifier', captures[1]);
        //}
    },
    /*
     * Parses a number from the input
     */
    numberToken: function numberToken() {
        return this.scan(/^ *(\d*\.?\d+)/, 'number')
        //var captures;
        //if (captures = /^ *(\d*\.?\d+)/.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('number', captures[1]);
        //}
    },
    /*
     * Parses a newline from the input
     */
    newlineToken: function newlineToken() {
        var res = this.scan(/^ *\n/, 'newline');
        if (res) {
            ++this.lineno;
            return res;
        }
        //var captures;
        //if (captures = /^ *\n/.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('newline');
        //}
    },

    /*
     * Parses for token
     */
    forToken: function forToken() {
        return this.scan(/^FOR\b/i, 'for');
        //var captures;
        //if (captures = /^FOR\b/i.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('for');
        //    //tok.variable = parseIdentifier();
        //    //if (!(captures = /^ *= */i.exec(this.input))) {
        //    //    throw new Error('For loop must be in form FOR identifier = range');
        //    //}
        //    //tok.range = parseRange();
        //}
    },
    /*
     * Parses a "NEXT" token from the input
     */
    nextToken: function nextToken() {
        return this.scan(/^ *(NEXT)\b/i, 'next');
        //var captures;
        //if (captures = /^ *(NEXT)/i.exec(this.input)) {
        //    this.consume(captures[0].length);
        //    return this.tok('next', captures[1]);
        //}
    },

    /*
     * Parses a "IF" token from the input
     */
    ifToken: function ifToken() {
        return this.scan(/^ *(IF)\b/i, 'if');
    },
    /*
     * Parses a "THEN" token from the input
     */
    thenToken: function thenToken() {
        return this.scan(/^ *(THEN)\b/i, 'then');
    },
    /*
     * Parses a "ELSEIF" token from the input
     */
    elseIfToken: function elseIfToken() {
        return this.scan(/^ *(ELSEIF)\b/i, 'elseif');
    },
    /*
     * Parses a "ELSE" token from the input
     */
    elseToken: function elseToken() {
        return this.scan(/^ *(ELSE)\b/i, 'else');
    },
    /*
     * Parses a "ENDIF" token from the input
     */
    endIfToken: function endIfToken() {
        return this.scan(/^ *(ENDIF)\b/i, 'endif');
    },

    /*
     * Indicates failure in the lexer
     */
    fail: function fail() {
        throw new Error('Unexpected text: "' + this.input.substr(0, 10) + '"');
    }
};
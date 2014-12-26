define(['require', './tokens'], function (require, Tokens) {
    "use strict";

    /**
     * A simple, regex based lexer
     *
     * @class
     * @param {module:compiler/compilationUnit.CompilationUnit} cu - The compilation unit to compile
     * @param {module:compiler/frontend/lexer.Rule[]} rules - Rules used in lexical analysis
     * @memberOf module:compiler/frontend/lexer
     */
    var Lexer = function Lexer(cu, rules) {
        /**
         * Current input of the lexer. Is reduced when the lexer is advanced.
         * @private
         */
        this.input = cu.source;
        /**
         * The rules the lexer follows.
         * @private
         */
        this.rules = rules;

        /**
         * For storing pre-fetched tokens
         * @private
         */
        this.stash = [];
        /**
         * The current line of the lexer
         * @private
         */
        this.line = 0;
    }


    Lexer.prototype = {
        /**
         * Advances the lexer by one token and returns it.
         * @returns {module:compiler/frontend/lexer/tokens.Token} The token popped from the source
         * @memberOf module:compiler/frontend/lexer.Lexer
         * @instance
         */
        advance: function advance() {
            if (this.stash.length <= 0)
                this.stashToken();
            return this.popStash();
        },

        /**
         * Peeks a token from the distance of n tokens and returns it without advancing the lexer.
         * @param {number} [n=1] - The number of tokens to peek in the future.
         * @returns {module:compiler/frontend/lexer/tokens.Token} The token peeked from n token in the future
         * @memberOf module:compiler/frontend/lexer.Lexer
         * @instance
         */
        peek: function peek(n) {
            if (n === undefined)
                n = 1;
            var fetch = n - this.stash.length;
            while (fetch-- > 0) this.stashToken();
            return this.stash[--n];
        },

        /**
         * Pops a token from the stash.
         * @returns {?module:compiler/frontend/lexer/tokens.Token} The token at the front of the stash. If no such token exists, returns null.
         * @private
         * @memberOf module:compiler/frontend/lexer.Lexer
         * @instance
         */
        popStash: function popStash() {
            if (this.stash.length <= 0)
                return null;
            return this.stash.shift();
        },

        /**
         * Adds a token to the stash.
         * @private
         * @memberOf module:compiler/frontend/lexer.Lexer
         * @instance
         */
        stashToken: function stashToken() {
            var token;

            do {
                token = this.nextToken();
            } while (token.type instanceof Tokens.WhitespaceToken);

            this.stash.push(token);
        },

        /**
         * Get the next token from the input
         * @returns {module:compiler/frontend/lexer/tokens.Token} The next token in the input
         * @private
         * @memberOf module:compiler/frontend/lexer.Lexer
         * @instance
         */
        nextToken: function nextToken() {
            // First try if the source has already ended
            if (this.input.length <= 0)
                return new Tokens.EOSToken(this.line);

            // Otherwise go through the rules and find the comforting rule
            var rule = this.rules.find(function (rule) {
                return rule.test(this.input);
            }, this);

            // Get the captures
            var captures = rule.capture(this.input);
            // Consume the input
            this.input = this.input.substr(captures[0].length);

            var token = new rule.type(this.line, captures);
            return token;
        },
    };

    return Lexer;
});
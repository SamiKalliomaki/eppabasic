define(['require', './tokens', 'compiler/compilationPhase'], function (require, tokens, compilationPhase) {
    "use strict";

    /**
     * A simple, regex based lexer
     *
     * @class
     * @extends {module:compiler/compilationPhase.CompilationPhase}
     * @param {module:compiler/frontend/lexer.Token[]} tokens
     * - Tokens returned by lexical analysis. Tokens are matched in the order they are in the array.
     * @memberOf module:compiler/frontend/lexer
     */
    var Lexer = function Lexer(tokens) {
        /**
         * The tokens the lexer supports.
         * @member
         * @private
         * @type {module:compiler/frontend/lexer.Rule[]}
         */
        this.tokens = tokens;
    }

    Lexer.prototype = Object.create(compilationPhase.CompilationPhase.prototype, { constructor: { value: Lexer } });

    /**
     * Executes the lexer. Results in tokens being stored in cu.tokens.
     * 
     * @instance
     * @param {module:compiler/compilationUnit.CompilationUnit} cu - Compilation unit the lexer uses
     * @memberOf module:compiler/frontend/lexer.Lexer
     */
    Lexer.prototype.run = function run(cu) {
        // The token being processed
        var token = null;

        // Initialize the state of the lexer
        this.input = cu.source;
        this.line = 1;

        // Tokens end up here
        cu.tokens = [];

        try {
            // Go through tokens until end of source
            while (!(token instanceof tokens.EOSToken)) {
                token = this.nextToken();
                cu.tokens.push(token);
            }
        } finally {
            // Finally return the current state
            delete this.input;
            delete this.line;
        }
    };

    /**
     * Get the next token from this.input. Keeps track of the current line in this.line;
     * @private
     * @returns {module:compiler/frontend/lexer/tokens.Token} The next token in the input
     * @memberOf module:compiler/frontend/lexer.Lexer
     */
    Lexer.prototype.nextToken = function nextToken() {
        // First try if the source has already ended
        if (this.input.length <= 0)
            return new tokens.EOSToken(this.line);

        // Go throug all tokens
        var tokenType = this.tokens.find(function (token) {
            // And try if it matches
            return !!token.pattern.exec(this.input);
        }, this);

        // Get the captures
        var captures = tokenType.pattern.exec(this.input);
        // Consume the input
        this.input = this.input.substr(captures[0].length);
        // Create the token
        var token = new tokenType(this.line, captures);
        // If the token is end of line, increase the line count
        if (token instanceof tokens.EOLToken) {
            this.line++;
        }

        return token;
    };

    return Lexer;
});
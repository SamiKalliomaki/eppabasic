define(['require', './tokens', 'compiler/compilationPhase'], function (require, tokens, compilationPhase) {
    "use strict";

    /**
     * A simple, regex based lexer
     *
     * @class
     * @extends {module:compiler/compilationPhase.CompilationPhase}
     * @param {module:compiler/frontend/lexer.Rule[]} rules - Rules used in lexical analysis
     * @memberOf module:compiler/frontend/lexer
     */
    var Lexer = function Lexer(rules) {
        /**
         * The rules the lexer follows.
         * @member
         * @private
         * @type {module:compiler/frontend/lexer.Rule[]}
         */
        this.rules = rules;
    }

    Lexer.prototype = Object.create(compilationPhase.CompilationPhase.prototype);

    Lexer.prototype.constructor = Lexer;

    /**
     * Executes the lexer. Results in tokens being stored in cu.tokens.
     * @instance
     * @param {module:compiler/compilationUnit.CompilationUnit} cu
     * @memberOf module:compiler/frontend/lexer.Lexer
     */
    Lexer.prototype.run = function run(cu) {
        var token = new tokens.Token(-1, ['']);

        this.input = cu.source;
        this.line = 1;

        cu.tokens = [];

        while(!(token instanceof tokens.EOSToken)) {
            token = this.nextToken();
            cu.tokens.push(token);
        }

        delete this.input;
        delete this.line;
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

        // Otherwise go through the rules and find the comforting rule
        var rule = this.rules.find(function (rule) {
            return rule.test(input);
        }, this);

        // Get the captures
        var captures = rule.capture(this.input);
        // Consume the input
        this.input = this.input.substr(captures[0].length);

        var token = new rule.type(this.line, captures);

        if(token instanceof tokens.EOLToken) {
            this.line++;
        }

        return token;
    };

    return Lexer;
});
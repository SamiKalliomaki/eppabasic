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

    /**
     * Executes the lexer. Results in tokens being stored in cu.tokens.
     * @instance
     * @param {module:compiler/compilationUnit.CompilationUnit} cu
     * @memberOf module:compiler/frontend/lexer.Lexer
     */
    Lexer.prototype.run = function run(cu) {
        var input = cu.source;
        var line = 1;
        var token = tokens.Token(-1, ['']);

        cu.tokens = [];

        while(!(token instanceof tokens.EOSToken)) {
            token = this.nextToken(input);
            cu.tokens.push(token);

            if(token instanceof tokens.EOLToken) {
                line++;
            }
        }
    };

    /**
     * Get the next token from the input
     * @private
     * @param {string} input Source code. This gets consumed.
     * @param {number} line Current line.
     * @returns {module:compiler/frontend/lexer/tokens.Token} The next token in the input
     * @memberOf module:compiler/frontend/lexer.Lexer
     */
    Lexer.prototype.nextToken = function nextToken(input, line) {
        // First try if the source has already ended
        if (input.length <= 0)
            return new tokens.EOSToken(line);

        // Otherwise go through the rules and find the comforting rule
        var rule = this.rules.find(function (rule) {
            return rule.test(input);
        }, this);

        // Get the captures
        var captures = rule.capture(input);
        // Consume the input
        input = input.substr(captures[0].length);

        var token = new rule.type(line, captures);
        return token;
    };

    return Lexer;
});
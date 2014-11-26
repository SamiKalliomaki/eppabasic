define(['require'], function (require) {
    "use strict";

    /**
     * A rule for the lexer
     *
     * @class
     * @param {regex} pattern - A pattern which the token should match
     * @param {compiler/frontend/lexer/token} type - A token type which the rule should match to
     * @memberOf module:compiler/frontend/lexer
     */
    function Rule(pattern, type) {
        /**
         * Pattern saved in rule
         * @member {regex}
         * @private
         */
        this.pattern = pattern;
        /**
         * Type of token
         * @member {compiler/frontend/lexer/toke}
         * @private
         */
        this.type = type;
    }

    Rule.prototype = {
        /**
         * Test if the input comforts the rule
         * @returns {boolean} Returns ture if the input comforts the rule, otherwise false.
         * @memberOf module:compiler/frontend/lexer.Rule
         * @instance
         */
        test: function test(input) {
            return !!this.capture(input);
        },

        /**
         * Excecutes the pattern on the input.
         * @returns {?string[]} The captures as an array. The first element is the whole capture. If the input doesn't comfort the rule, a null is returned
         * @memberOf module:compiler/frontend/lexer.Rule
         * @instance
         */
        capture: function capture(input) {
            return this.pattern.exec(input);
        }
    };

    return Rule;
});
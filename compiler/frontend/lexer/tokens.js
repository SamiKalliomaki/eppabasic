/**
 * Contais all tokens used in EppaBasic
 * @module compiler/frontend/lexer/tokens
 */
define(['require'], function (require) {
    "use strict";

    /**
     * A token of source code
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf! module:compiler/frontend/lexer/tokens
     * @abstract
     */
    function Token(line, captures) {
        /**
         * The line number of the token
         * @type {number}
         */
        this.line = line;
        /**
         * The original text of the token
         * @type {string}
         */
        this.text = captures[0];
    };
    Token.prototype = {
        /**
         * Does nothing
         * @memberOf module:compiler/frontend/lexer/tokens.Token
         * @instance
         */
        no: function no() { }
    }

    /**
     * A token containing only whitespaces
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function WhitespaceToken(line, captures) {
        Token.call(this, line, captures);
    };

    WhitespaceToken.prototype = new Token(-1, ['']);
    WhitespaceToken.prototype.constructor = WhitespaceToken;

    /**
     * End Of Source token
     *
     * @class
     * @param {number} line - The line the token is located
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function EOSToken(line) {
        Token.call(this, line, ['']);
    };

    EOSToken.prototype = new Token(-1, ['']);
    EOSToken.prototype.constructor = EOSToken;

    return {
        EOSToken: EOSToken,
        Token: Token,
        WhitespaceToken: WhitespaceToken,
    };
});
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
    };

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

    WhitespaceToken.prototype = Object.create(Token.prototype);
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

    EOSToken.prototype = Object.create(Token.prototype);
    EOSToken.prototype.constructor = EOSToken;

    /**
     * Comment token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function CommentToken(line, captures) {
        Token.call(this, line, captures);
        /**
         * The text written in the comment
         * @type {string}
         */
        this.message = captures[1];
    };

    CommentToken.prototype = Object.create(Token.prototype);
    CommentToken.prototype.constructor = CommentToken;

    /**
     * Operator token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function OperatorToken(line, captures) {
        Token.call(this, line, captures);
        /**
         * The type of the token
         * @type {string}
         */
        this.type = captures[1];
    };

    OperatorToken.prototype = Object.create(Token.prototype);
    OperatorToken.prototype.constructor = OperatorToken;

    /**
     * Number token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function NumberToken(line, captures) {
        Token.call(this, line, captures);
        /**
         * The value of the number
         * @type {string}
         */
        this.value = parseFloat(captures[1]);       // TODO Change to bigint
    };

    NumberToken.prototype = Object.create(Token.prototype);
    NumberToken.prototype.constructor = NumberToken;

    /**
     * String token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function StringToken(line, captures) {
        Token.call(this, line, captures);
        /**
         * The value of the string
         * @type {string}
         */
        ''.replace()
        this.value = captures[1].replace(/""/g, '"');
    };

    StringToken.prototype = Object.create(Token.prototype);
    StringToken.prototype.constructor = StringToken;

    /**
     * Comma token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function CommaToken(line, captures) {
        Token.call(this, line, captures);
    };

    CommaToken.prototype = Object.create(Token.prototype);
    CommaToken.prototype.constructor = CommaToken;

    /**
     * Parenthesis token
     *
     * @class
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    function ParenthesisToken(line, captures) {
        Token.call(this, line, captures);
    };

    ParenthesisToken.prototype = Object.create(Token.prototype);
    ParenthesisToken.prototype.constructor = ParenthesisToken;

    return {
        EOSToken: EOSToken,
        Token: Token,
        WhitespaceToken: WhitespaceToken,
        CommentToken: CommentToken,
        OperatorToken: OperatorToken,
        NumberToken: NumberToken,
        StringToken: StringToken,
        CommaToken: CommaToken,
        ParenthesisToken: ParenthesisToken,
    };
});
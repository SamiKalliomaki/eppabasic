/**
 * Contais all tokens used in EppaBasic
 * @module compiler/frontend/lexer/tokens
 */
define(['require'], function (require) {
    "use strict";

    /**
     * Abstract base type for all tokens
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
         * The pattern the token must match
         * 
         * @type {RegExp}
         * @static
         * @memberOf module:compiler/frontend/lexer/tokens.Token
         */
        pattern: null
    };

    /**
     * A helper function for creating token constructors.
     * 
     * @param {RegExp} pattern - Pattern the token must match
     * 
     * @private
     * @static
     * @memberOf module:compiler/frontend/lexer/tokens
     */
    function makeToken(pattern) {
        // Extend Token
        function NewToken(line, captures) {
            Token.call(this, line, captures);
        }
        Object.setPrototypeOf(NewToken, Token);
        NewToken.prototype = Object.create(Token.prototype, { constructor: { value: NewToken } });

        // Setup static values
        NewToken.prototype.pattern = pattern;

        return NewToken;
    }

    // --- Special tokens ---
    /**
     * Token representing an end of source
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
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

    // --- Mass Tokens ---
    /**
     * Token representing an end of line
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var EOLToken = makeToken('^(\r?\n)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\r?\n)/
     * @memberOf module:compiler/frontend/lexer/tokens.NumberToken
     */

    /**
     * Token representing a number
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var NumberToken = makeToken('^(\\d+(?:\\.\\d+)?)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\d+(?:\.\d+)?)/
     * @memberOf module:compiler/frontend/lexer/tokens.NumberToken
     */

    /**
     * Token representing a string
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var StringToken = makeToken('^"((?:""|[^"])*)"');
    /**
     * @constant {RegExp} pattern
     * @default /^"((?:""|[^"])*)"/
     * @memberOf module:compiler/frontend/lexer/tokens.StringToken
     */

    /**
     * Token representing an identifier
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var IdentifierToken = makeToken('^([_\\p{L}][_\\p{L}\\p{N}]*)');
    /**
     * @constant {RegExp} pattern
     * @default /^([_\p{L}][_\p{L}\p{N}]*)/
     * @memberOf module:compiler/frontend/lexer/tokens.IdentifierToken
     */

    /**
     * Token representing a left bracket
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var LeftBracketToken = makeToken('^(\\[)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\[)/
     * @memberOf module:compiler/frontend/lexer/tokens.LeftBracketToken
     */

    /**
     * Token representing a right bracket
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var RightBracketToken = makeToken('^(\\])');
    /**
     * @constant {RegExp} pattern
     * @default /^(\])/
     * @memberOf module:compiler/frontend/lexer/tokens.RightBracketToken
     */

    /**
     * Token representing a left parenthesis
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var LeftParenthesisToken = makeToken('^(\\()');
    /**
     * @constant {RegExp} pattern
     * @default /^(\()/
     * @memberOf module:compiler/frontend/lexer/tokens.LeftParenthesisToken
     */

    /**
     * Token representing a right parenthesis
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var RightParenthesisToken = makeToken('^(\\))');
    /**
     * @constant {RegExp} pattern
     * @default /^(\))/
     * @memberOf module:compiler/frontend/lexer/tokens.RightParenthesisToken
     */

    /**
     * Token representing a comma
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var CommaToken = makeToken('^(,)');
    /**
     * @constant {RegExp} pattern
     * @default /^(,)/
     * @memberOf module:compiler/frontend/lexer/tokens.CommaToken
     */

    /**
     * Token representing a not operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var NotToken = makeToken('^(Not)');
    /**
     * @constant {RegExp} pattern
     * @default /^(Not)/
     * @memberOf module:compiler/frontend/lexer/tokens.NotToken
     */

    /**
     * Token representing a power operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var PowToken = makeToken('^(\\^)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\^)/
     * @memberOf module:compiler/frontend/lexer/tokens.PowToken
     */

    /**
     * Token representing a multiplication operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var MultiplicationToken = makeToken('^(\\*)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\*)/
     * @memberOf module:compiler/frontend/lexer/tokens.MultiplicationToken
     */

    /**
     * Token representing a division operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var DivisionToken = makeToken('^(\\/)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\/)/
     * @memberOf module:compiler/frontend/lexer/tokens.DivisionToken
     */

    /**
     * Token representing an integer division operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var IntegerDivisionToken = makeToken('^(\\\\)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\\)/
     * @memberOf module:compiler/frontend/lexer/tokens.IntegerDivisionToken
     */

    /**
     * Token representing a modulo operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var ModToken = makeToken('^(Mod)');
    /**
     * @constant {RegExp} pattern
     * @default /^(Mod)/
     * @memberOf module:compiler/frontend/lexer/tokens.ModToken
     */

    /**
     * Token representing a plus operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var PlusToken = makeToken('^(\\+)');
    /**
     * @constant {RegExp} pattern
     * @default /^(\+)/
     * @memberOf module:compiler/frontend/lexer/tokens.PlusToken
     */

    /**
     * Token representing a minus operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var MinusToken = makeToken('^(-)');
    /**
     * @constant {RegExp} pattern
     * @default /^(-)/
     * @memberOf module:compiler/frontend/lexer/tokens.MinusToken
     */

    /**
     * Token representing an equal operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var EqualToken = makeToken('^(=)');
    /**
     * @constant {RegExp} pattern
     * @default /^(=)/
     * @memberOf module:compiler/frontend/lexer/tokens.EqualToken
     */

    /**
     * Token representing a not equal operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var NotEqualToken = makeToken('^(<>)');
    /**
     * @constant {RegExp} pattern
     * @default /^(<>)/
     * @memberOf module:compiler/frontend/lexer/tokens.NotEqualToken
     */

    /**
     * Token representing a less than operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var LessThanToken = makeToken('^(<)');
    /**
     * @constant {RegExp} pattern
     * @default /^(<)/
     * @memberOf module:compiler/frontend/lexer/tokens.LessThanToken
     */

    /**
     * Token representing a less than or equal operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var LessThanOrEqualToken = makeToken('^(<=)');
    /**
     * @constant {RegExp} pattern
     * @default /^(<>)/
     * @memberOf module:compiler/frontend/lexer/tokens.LessThanOrEqualToken
     */

    /**
     * Token representing a greater than operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var GreaterThanToken = makeToken('^(<)');
    /**
     * @constant {RegExp} pattern
     * @default /^(<)/
     * @memberOf module:compiler/frontend/lexer/tokens.GreaterThanToken
     */

    /**
     * Token representing a greater than or equal operator
     * 
     * @param {number} line - The line the token is located
     * @param {string[]} captures - An array of captures returned by regexp.match
     * 
     * @class
     * @memberOf module:compiler/frontend/lexer/tokens
     * @extends module:compiler/frontend/lexer/tokens.Token
     */
    var GreaterThanOrEqualToken = makeToken('^(<=)');
    /**
     * @constant {RegExp} pattern
     * @default /^(<>)/
     * @memberOf module:compiler/frontend/lexer/tokens.GreaterThanOrEqualToken
     */

    ///**
    // * Comment token
    // *
    // * @class
    // * @param {number} line - The line the token is located
    // * @param {string[]} captures - An array of captures returned by regexp.match
    // * @memberOf module:compiler/frontend/lexer/tokens
    // * @extends module:compiler/frontend/lexer/tokens.Token
    // */
    //function CommentToken(line, captures) {
    //    Token.call(this, line, captures);
    //    /**
    //     * The text written in the comment
    //     * @type {string}
    //     */
    //    this.message = captures[1];
    //};

    //CommentToken.prototype = Object.create(Token.prototype);
    //CommentToken.prototype.constructor = CommentToken;

    return {
        CommaToken: CommaToken,
        DivisionToken: DivisionToken,
        EOLToken: EOLToken,
        EOSToken: EOSToken,
        EqualToken: EqualToken,
        GreaterThanOrEqualToken: GreaterThanOrEqualToken,
        GreaterThenToken: GreaterThanToken,
        IdentifierToken: IdentifierToken,
        IntegerDivisionToken: IntegerDivisionToken,
        LeftBracketToken: LeftBracketToken,
        LeftParenthesisToken: LeftParenthesisToken,
        LessThanOrEqualToken: LessThanOrEqualToken,
        LessThanToken: LessThanToken,
        MinusToken: MinusToken,
        ModToken: ModToken,
        MultiplicationToken: MultiplicationToken,
        NotEqualToken: NotEqualToken,
        NotToken: NotToken,
        NumberToken: NumberToken,
        PlusToken: PlusToken,
        PowToken: PowToken,
        RightBracketToken: RightBracketToken,
        RightParenthesisToken: RightParenthesisToken,
        StringToken: StringToken,
        Token: Token
    };
});
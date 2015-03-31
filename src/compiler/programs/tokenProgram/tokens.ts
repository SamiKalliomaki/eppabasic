/// <reference path="../../../../lib/vendor" />

import SourceFile = require("../sourceProgram/SourceFile");
import XRegExp = require('xregexp');

/**
 * Base token every token extends.
 */
export class Token {
    /**
     * File this token belongs to.
     */
    private _source: SourceFile;
    /**
     * Start position of this token in the file.
     */
    private _start: SourceFile.Position;
    /**
     * End position of this token in the file.
     */
    private _end: SourceFile.Position;

    /**
     * Constructs a new Token.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        this._source = source;
        this._start = start;
        this._end = end;
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return null;
    }

    /**
     * Piece of source this token consists of
     */
    get matchingSource(): string {
        return this._source.code.substring(this._start.offset, this._end.offset)
    }
}

/**
 * End Of Source token.
 */
export class EOSToken extends Token {
    /**
     * Constructs a new EOSToken.
     */
    constructor(source: SourceFile, position: SourceFile.Position) {
        super(source, position, position);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return /^/;
    }
}

/**
 * Comment token.
 */
export class CommentToken extends Token {
    /**
     * Constructs a new CommentToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\'[^\n]*');
    }
}

/**
 * Operator token.
 */
export class OperatorToken extends Token {
    /**
     * Constructs a new OperatorToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return /^/;
    }
}

/**
 * <> token.
 */
export class NotEqualToken extends OperatorToken {
    /**
     * Constructs a new NotEqualToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?<>');
    }
}

/**
 * = token.
 */
export class EqualToken extends OperatorToken {
    /**
     * Constructs a new EqualToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?=');
    }
}

/**
 * < token.
 */
export class LessThanToken extends OperatorToken {
    /**
     * Constructs a new LessThanToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?<');
    }
}

/**
 * > token.
 */
export class GreaterThanToken extends OperatorToken {
    /**
     * Constructs a new GreaterThanToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?>');
    }
}

/**
 * <= token.
 */
export class LessOrEqualToken extends OperatorToken {
    /**
     * Constructs a new LessOrEqualToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?<=');
    }
}

/**
 * >= token.
 */
export class GreaterOrEqualToken extends OperatorToken {
    /**
     * Constructs a new GreaterOrEqualToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?>=');
    }
}

/**
 * + token.
 */
export class AdditionToken extends OperatorToken {
    /**
     * Constructs a new AdditionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\+');
    }
}

/**
 * - token.
 */
export class SubstractionToken extends OperatorToken {
    /**
     * Constructs a new SubstractionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?-');
    }
}

/**
 * * token.
 */
export class MultiplicationToken extends OperatorToken {
    /**
     * Constructs a new MultiplicationToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\*');
    }
}

/**
 * / token.
 */
export class DivisionToken extends OperatorToken {
    /**
     * Constructs a new DivisionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?/');
    }
}

/**
 * \ token.
 */
export class IntegerDivisionToken extends OperatorToken {
    /**
     * Constructs a new IntegerDivisionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\\\');
    }
}

/**
 * ^ token.
 */
export class PowerToken extends OperatorToken {
    /**
     * Constructs a new PowerToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\^');
    }
}

/**
 * Mod token.
 */
export class ModToken extends OperatorToken {
    /**
     * Constructs a new ModToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Mod\\b', 'i');
    }
}

/**
 * & token.
 */
export class ConcatenationToken extends OperatorToken {
    /**
     * Constructs a new ConcatenationToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?&');
    }
}

/**
 * And token.
 */
export class AndToken extends OperatorToken {
    /**
     * Constructs a new AndToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?And\\b', 'i');
    }
}

/**
 * Or token.
 */
export class OrToken extends OperatorToken {
    /**
     * Constructs a new OrToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Or\\b', 'i');
    }
}

/**
 * Xor token.
 */
export class XorToken extends OperatorToken {
    /**
     * Constructs a new XorToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Xor\\b', 'i');
    }
}

/**
 * Not token.
 */
export class NotToken extends OperatorToken {
    /**
     * Constructs a new NotToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Not\\b', 'i');
    }
}

/**
 * Number constant token.
 */
export class NumberToken extends Token {
    /**
     * Constructs a new NumberToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?-?\\d*\\.\\d+\\nc');
    }

    /**
     * Value of the number constant.
     */
    get value(): number {
        // Extract number
        var original = this.matchingSource.trim();
        // Convert to double
        return parseFloat(original);
    }
}

/**
 * String constant token.
 */
export class StringToken extends Token {
    /**
     * Constructs a new StringToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?"([^"\n]|"")*"\\nc');
    }

    /**
     * Value of the string constant.
     */
    get value(): string {
        // Extract quoted string
        var original = this.matchingSource.trim();
        // Remove double quotes from the begining and the end
        original = original.substring(1, original.length - 1);
        // Convert two double quotes to a single double quote ("" -> ")
        return original.split('""').join('"');
    }
}

/**
 * Comma token.
 */
export class CommaToken extends Token {
    /**
     * Constructs a new CommaToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?,');
    }
}

/**
 * Left parenthesis token.
 */
export class LeftParenthesisToken extends Token {
    /**
     * Constructs a new LeftParenthesisToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\(');
    }
}

/**
 * Right parenthesis token.
 */
export class RightParenthesisToken extends Token {
    /**
     * Constructs a new RightParenthesisToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\)');
    }
}

/**
 * Left bracket token.
 */
export class LeftBracketToken extends Token {
    /**
     * Constructs a new LeftBracketToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\[');
    }
}

/**
 * Right bracket token.
 */
export class RightBracketToken extends Token {
    /**
     * Constructs a new RightBracketToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\\]');
    }
}

/**
 * For token.
 */
export class ForToken extends Token {
    /**
     * Constructs a new ForToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?For\\b', 'i');
    }
}

/**
 * To token.
 */
export class ToToken extends Token {
    /**
     * Constructs a new ToToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?To\\b', 'i');
    }
}

/**
 * Step token.
 */
export class StepToken extends Token {
    /**
     * Constructs a new StepToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Step\\b', 'i');
    }
}

/**
 * Next token.
 */
export class NextToken extends Token {
    /**
     * Constructs a new NextToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Next\\b', 'i');
    }
}

/**
 * Do token.
 */
export class DoToken extends Token {
    /**
     * Constructs a new DoToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Do\\b', 'i');
    }
}

/**
 * Loop token.
 */
export class LoopToken extends Token {
    /**
     * Constructs a new LoopToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Loop\\b', 'i');
    }
}

/**
 * While token.
 */
export class WhileToken extends Token {
    /**
     * Constructs a new WhileToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?While\\b', 'i');
    }
}

/**
 * Until token.
 */
export class UntilToken extends Token {
    /**
     * Constructs a new UntilToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Until\\b', 'i');
    }
}

/**
 * If token.
 */
export class IfToken extends Token {
    /**
     * Constructs a new IfToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?If\\b', 'i');
    }
}

/**
 * Then token.
 */
export class ThenToken extends Token {
    /**
     * Constructs a new ThenToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Then\\b', 'i');
    }
}

/**
 * Else if token.
 */
export class ElseIfToken extends Token {
    /**
     * Constructs a new ElseIfToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Else\\h*If\\b', 'i');
    }
}

/**
 * Else token.
 */
export class ElseToken extends Token {
    /**
     * Constructs a new ElseToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Else\\b');
    }
}

/**
 * End if token.
 */
export class EndIfToken extends Token {
    /**
     * Constructs a new EndIfToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?End\\h*If\\b', 'i');
    }
}

/**
 * Dim token.
 */
export class DimToken extends Token {
    /**
     * Constructs a new DimToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Dim\\b');
    }
}

/**
 * As token.
 */
export class AsToken extends Token {
    /**
     * Constructs a new AsToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?As\\b');
    }
}

/**
 * Function token.
 */
export class FunctionToken extends Token {
    /**
     * Constructs a new FunctionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Function\\b');
    }
}

/**
 * Return token.
 */
export class ReturnToken extends Token {
    /**
     * Constructs a new ReturnToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Return\\b');
    }
}

/**
 * End Function token.
 */
export class EndFunctionToken extends Token {
    /**
     * Constructs a new EndFunctionToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?End\\h*Function\\b', 'i');
    }
}

/**
 * Sub token.
 */
export class SubToken extends Token {
    /**
     * Constructs a new SubToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?Sub\\b');
    }
}

/**
 * End Sub token.
 */
export class EndSubToken extends Token {
    /**
     * Constructs a new EndSubToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?End\\h*Sub\\b', 'i');
    }
}

/**
 * Identifier token.
 */
export class IdentifierToken extends Token {
    /**
     * Constructs a new IdentifierToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?[_\\p{L}][_\\p{L}\\p{N}]*\\b');
    }

    /**
     * Name of the identifier.
     */
    get name(): string {
        // Extract name using regex
        return XRegExp('^\\h*?([_\\p{L}][_\\p{L}\\p{N}]*)\\b').exec(this.matchingSource)[1];
    }
}

/**
 * New line token.
 */
export class NewLineToken extends Token {
    /**
     * Constructs a new NewLineToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?\r?\n');
    }
}


/**
 * Error token.
 */
export class ErrorToken extends Token {
    /**
     * Constructs a new ErrorToken.
     */
    constructor(source: SourceFile, start: SourceFile.Position, end: SourceFile.Position) {
        super(source, start, end);
    }

    /**
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^.');
    }
}

// Extend XRegExp
XRegExp.addToken(
    /\\h/,
    function (match, scope): string {
        var range = '\\t\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000';
        return scope === XRegExp.INSIDE_CLASS ?
            range : '[' + range + ']';
    },
    XRegExp.INSIDE_CLASS | XRegExp.OUTSIDE_CLASS
);
// No character
XRegExp.addToken(
    /\\nc/,
    function (match, scope): string {
        return '(?=[\\t\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000]|\r?\n|$)';
    },
    XRegExp.OUTSIDE_CLASS
);

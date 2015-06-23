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
    constructor(source: SourceFile = null, start: SourceFile.Position = null, end: SourceFile.Position = null) {
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
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?-?\\d*\\.?\\d+\\b');
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
     * Pattern this tokens type should match.
     */
    static get pattern(): RegExp {
        return XRegExp('^\\h*?"([^"\n]|"")*"');
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

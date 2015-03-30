/// <reference path="../../../lib/vendor" />

import Transformer = require('./Transformer');
import SourceProgram = require("../programs/SourceProgram");
import SourceFile = require("../programs/sourceProgram/SourceFile");
import TokenProgram = require("../programs/TokenProgram");
import TokenFile = require("../programs/tokenProgram/TokenFile");
import tokens = require("../programs/tokenProgram/tokens");

/**
 * Transforms from SourceProgram to TokenProgram.
 */
class SourceToTokenTransformer implements Transformer {
    /**
    * Token types this transformer can consume in order.
    */
    private _tokenTypes: typeof tokens.Token[];

    /**
     * Contructs a new SourceToTokenTransformer.
     *
     * @param tokenTypes Types of tokens this transformer can consume in order.
     */
    constructor(tokenTypes: typeof tokens.Token[]) {
        this._tokenTypes = tokenTypes;
    }

    /**
     * Transforms from SourceProgram to TokenProgram.
     *
     * Preserves source.
     *
     * @param source Program to be transformed
     *
     * @returns Promise of transformed program.
     */
    transform(source: SourceProgram): Promise<TokenProgram> {
        return new Promise<TokenProgram>((resolve: (program: TokenProgram) => void, reject: (error: any) => void) => {
            var targetFiles = new Set<TokenFile>();
            var targetMainFile: TokenFile;

            source.files.forEach((sourceFile: SourceFile) => {
                var tokenizer = new Tokenizer(sourceFile, this._tokenTypes);
                var tokens = tokenizer.tokenize();
                var targetFile = new TokenFile(tokens);
                targetFiles.add(targetFile);
                if (sourceFile === source.mainFile)
                    targetMainFile = targetFile;
            });

            var targetProgram = new TokenProgram(targetFiles, targetMainFile);

            resolve(targetProgram);
        });
    }

    /**
     * Creates array of token types default EppaBasic program uses.
     *
     * @returns Array of types of tokens EppaBasic compiler defaults to.
     */
    static defaultTokenTypes(): typeof tokens.Token[] {
        return [
            // Punctuations
            tokens.CommentToken,
            tokens.CommaToken,
            tokens.LeftParenthesisToken,
            tokens.RightParenthesisToken,
            tokens.LeftBracketToken,
            tokens.RightBracketToken,
            tokens.NewLineToken,
            // Operators
            tokens.LessThanToken,
            tokens.LessOrEqualToken,
            tokens.GreaterThanToken,
            tokens.GreaterOrEqualToken,
            tokens.EqualToken,
            tokens.NotEqualToken,
            tokens.AndToken,
            tokens.OrToken,
            tokens.XorToken,
            tokens.NotToken,
            tokens.AdditionToken,
            tokens.SubstractionToken,
            tokens.MultiplicationToken,
            tokens.DivisionToken,
            tokens.IntegerDivisionToken,
            tokens.PowerToken,
            tokens.ModToken,
            tokens.ConcatenationToken,
            // For loops
            tokens.ForToken,
            tokens.ToToken,
            tokens.StepToken,
            tokens.NextToken,
            // Do loops
            tokens.DoToken,
            tokens.LoopToken,
            tokens.UntilToken,
            tokens.WhileToken,
            // Conditions
            tokens.IfToken,
            tokens.ThenToken,
            tokens.ElseIfToken,
            tokens.ElseToken,
            tokens.EndIfToken,
            // Functions
            tokens.FunctionToken,
            tokens.EndFunctionToken,
            tokens.SubToken,
            tokens.EndSubToken,
            tokens.ReturnToken,
            // Variable definitions
            tokens.DimToken,
            tokens.AsToken,
            // Constants
            tokens.NumberToken,
            tokens.StringToken,
            // Rest
            tokens.IdentifierToken
        ];
    }
}

/**
 * Tokenizes source code according to the rules.
 */
class Tokenizer {
    /**
     * Input being consumed
     */
    private _input: string;
    /**
     * Source file being parsed
     */
    private _sourceFile: SourceFile;
    /**
     * Current position in the source file
     */
    private _position: SourceFile.Position;
    /**
     * Token types this tokenizer can consume in order.
     */
    private _tokenTypes: typeof tokens.Token[];

    /**
     * Constructs a new Tokenizer.
     *
     * @param sourceFile File to be tokenized.
     * @param tokenTypes Types of tokens this tokenizer can consume in order.
     */
    constructor(sourceFile: SourceFile, tokenTypes: typeof tokens.Token[]) {
            this._sourceFile = sourceFile;
            this._input = sourceFile.code;
            this._position = new SourceFile.Position(0, 0, 0);
            this._tokenTypes = tokenTypes;
    }

    /**
     * Tokenizes the whole input.
     *
     * @returns Tokenized input.
     */
    tokenize(): tokens.Token[] {
        var parsedTokens: tokens.Token[] = [];

        var nextToken = null;
        do {
            nextToken = this.nextToken();
            parsedTokens.push(nextToken);
        } while (!(nextToken instanceof tokens.EOSToken));

        return parsedTokens;
    }

    /**
     * Extracts the next token from the input.
     *
     * @retruns Next token in the input.
     */
    private nextToken(): tokens.Token {
        if (this._input.length <= 0)
            return new tokens.EOSToken(this._sourceFile, this._position);

        var tokenConstructor = this.nextTokenType();

        var startPosition = this._position;
        var consumed = tokenConstructor.pattern.exec(this._input)[0];

        // Consume input
        if (tokenConstructor === tokens.NewLineToken)
            this._position = this._position.advance(consumed.length, true);
        else
            this._position = this._position.advance(consumed.length, false);
        this._input = this._input.substr(consumed.length);

        var endPosition = this._position;

        return new tokenConstructor(this._sourceFile, startPosition, endPosition);
    }

    /**
     * Find matching token type.
     * In case of no token type matching returns tokens.ErrorToken.
     */
     private nextTokenType(): typeof tokens.Token {
         var tokenConstructor = this._tokenTypes.find((tokenConstructor): boolean => {
             return tokenConstructor.pattern.test(this._input);
         });
         if (!tokenConstructor) {
             tokenConstructor = tokens.ErrorToken;
         }
         return tokenConstructor;
     }
}

export = SourceToTokenTransformer;

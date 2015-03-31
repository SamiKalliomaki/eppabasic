/// <reference path="../../../lib/vendor" />

import Transformer = require('./Transformer');
import TokenProgram = require("../programs/TokenProgram");
import TokenFile = require("../programs/tokenProgram/TokenFile");
import tokens = require("../programs/tokenProgram/tokens");

/**
 * Removes all tokens of specific type from the TokenProgram.
 */
class TokenRemoverTransformer implements Transformer {
    /**
    * Token types to remove from the program
    */
    private _tokenTypes: Set<typeof tokens.Token>;

    /**
     * Contructs a new TokenRemoverTransformer.
     *
     * @param tokenTypes Types of tokens to remove from the program.
     */
    constructor(tokenTypes: Set<typeof tokens.Token>) {
        this._tokenTypes = tokenTypes;
    }

    /**
     * Removes all tokens of specific type from the stream
     *
     * Preserves source.
     *
     * @param source Program to be transformed
     *
     * @returns Promise of transformed program.
     */
    transform(source: TokenProgram): Promise<TokenProgram> {
        return new Promise<TokenProgram>((resolve: (program: TokenProgram) => void, reject: (error: any) => void) => {
            var targetFiles = new Set<TokenFile>();
            var targetMainFile = this.transformFile(source.mainFile);
            
            source.files.forEach((sourceFile: TokenFile) => {
                targetFiles.add(this.transformFile(sourceFile));
            });

            var targetProgram = new TokenProgram(targetFiles, targetMainFile);

            resolve(targetProgram);
        });
    }

    /**
     * Does the transformation on a single file.
     *
     * @param sourceFile File to transform.
     * @return Transformed file.
     */
    private transformFile(sourceFile: TokenFile): TokenFile {
        var targetTokens = sourceFile.tokens.filter((token: tokens.Token): boolean => {
            return !this._tokenTypes.has(<typeof tokens.Token>token.constructor);
        });
        var targetFile = new TokenFile(targetTokens);
        return targetFile;
    }
}

export = TokenRemoverTransformer;

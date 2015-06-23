/// <reference path="../../../lib/vendor" />

import Transformer = require('./Transformer');
import SyntaxTreeProgram = require('../programs/SyntaxTreeProgram');
import AstProgram = require('../programs/AstProgram');

class SyntaxTreeToAstTransformer implements Transformer {


        /**
         * Transforms from syntax tree program to ast program.
         *
         * @param source Program to be transformed
         *
         * @returns Promise of transformed program.
         */
        transform(source: SyntaxTreeProgram): Promise<AstProgram> {
            return null;
        }
}

export = SyntaxTreeToAstTransformer;

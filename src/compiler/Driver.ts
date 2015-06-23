import SourceProgram = require('./programs/SourceProgram');
import SourceFile = require('./programs/sourceProgram/SourceFile');
import MultiTransformer = require('./transformers/MultiTransformer');
import SourceToTokenTransformer = require('./transformers/SourceToTokenTransformer');
import TokenToSyntaxTreeTransformer = require('./transformers/TokenToSyntaxTreeTransformer');
import SyntaxTreeToAstTransformer = require('./transformers/SyntaxTreeToAstTransformer');

class Driver {
    // TODO Replace Promise<any> with appropriate type
    public compile(source: string): Promise<any> {
        var sourceProg = new SourceProgram(new Set<SourceFile>(), new SourceFile(source));

        var transformer = new MultiTransformer([
            new SourceToTokenTransformer(SourceToTokenTransformer.defaultTokenTypes()),
            new TokenToSyntaxTreeTransformer(),
            new SyntaxTreeToAstTransformer()
        ]);

        return transformer.transform(sourceProg);
    }
}

export = Driver;

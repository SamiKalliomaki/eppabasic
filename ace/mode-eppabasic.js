ace.define('ace/mode/eppabasic', ['require', 'exports', 'module'], function(require, exports, module) {
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;

// defines the language specific highlighters and folding rules
//var EppaBasicHighlightRules = require("./mynew_highlight_rules").EppaBasicHighlightRules;
//var EppaBasicFoldMode = require("./folding/mynew").EppaBasicFoldMode;

function CustomTokenizer() {
    this.lexer = new Lexer('', true, true);
    this.tokenTypes = {
        'comment': 'comment',
        'number': 'constant.numeric',
        'string': 'string',
        'lt': 'keyword.operator',
        'lte': 'keyword.operator',
        'gt': 'keyword.operator',
        'gte': 'keyword.operator',
        'eq': 'keyword.operator',
        'neq': 'keyword.operator',
        'and': 'keyword.operator',
        'or': 'keyword.operator',
        'xor': 'keyword.operator',
        'plus': 'keyword.operator',
        'minus': 'keyword.operator',
        'mul': 'keyword.operator',
        'div': 'keyword.operator',
        'pow': 'keyword.operator',
        'mod': 'keyword.operator',
        'concat': 'keyword.operator',
        'comma': 'punctuation.operator',
        'lparen': 'paren.lparen',
        'rparen': 'paren.rparen',

        // For loops
        'for': 'keyword.control',
        'to': 'keyword.control',
        'step': 'keyword.control',
        'next': 'keyword.control',

        // Do loops
        'do': 'keyword.control',
        'loop': 'keyword.control',
        'until': 'keyword.control',
        'while': 'keyword.control',

        // If statements
        'if': 'keyword.control',
        'then': 'keyword.control',
        'elseif': 'keyword.control',
        'else': 'keyword.control',
        'endif': 'keyword.control',

        // Variable declarations
        'dim': 'keyword.other',
        'as': 'keyword.other',

        // Function declarations
        'function': 'keyword.other',
        'return': 'keyword.control',
        'endfunction': 'keyword.other',

        // Subprogram declarations
        'sub': 'keyword.other',
        'endsub': 'keyword.other',

        // Arrays
        'lbracket': 'paren.lparen',
        'rbracket': 'paren.rparen',
    }
}

CustomTokenizer.prototype = {
    getLineTokens: function(line, state, row) {
        console.log(line);

        var tokens = [];
        this.lexer.input = line;

        do {
            var token = this.lexer.next();
            if(token.code !== undefined) {
                tokens.push({ type: this.tokenTypes[token.type] || '', value: token.code });
            }
        } while(token.type != 'eos' && token !== null);

        return {
            tokens: tokens,
            state: ''
        };
    }
}

var Mode = function() {
    this.getTokenizer = function() {
        if (!this.$tokenizer) {
            this.$tokenizer = new CustomTokenizer();
        }
        return this.$tokenizer;
    };

    // set everything up
    //this.HighlightRules = EppaBasicHighlightRules;
    //this.$outdent = new MatchingBraceOutdent();
    //this.foldingRules = new EppaBasicFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

}).call(Mode.prototype);

exports.Mode = Mode;
});
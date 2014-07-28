define("ace/mode/eppabasic",["require","exports","module","ace/lib/oop","ace/mode/text","ace/worker/worker_client","ace/range"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var WorkerClient = require("../worker/worker_client").WorkerClient;

var Range = require("../range").Range;

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
        'idiv': 'keyword.operator',
        'pow': 'keyword.operator',
        'mod': 'keyword.operator',
        'concat': 'keyword.operator',
        'comma': 'punctuation.operator',
        'lparen': 'paren.lparen',
        'rparen': 'paren.rparen',
        'for': 'keyword.control',
        'to': 'keyword.control',
        'step': 'keyword.control',
        'next': 'keyword.control',
        'do': 'keyword.control',
        'loop': 'keyword.control',
        'until': 'keyword.control',
        'while': 'keyword.control',
        'if': 'keyword.control',
        'then': 'keyword.control',
        'elseif': 'keyword.control',
        'else': 'keyword.control',
        'endif': 'keyword.control',
        'dim': 'keyword.other',
        'as': 'keyword.other',
        'function': 'keyword.other',
        'return': 'keyword.control',
        'endfunction': 'keyword.other',
        'sub': 'keyword.other',
        'endsub': 'keyword.other',
        'lbracket': 'paren.lparen',
        'rbracket': 'paren.rparen',
    };
    this.specialIdentifiers = {
        'clearcolor': 'support.function',
        'drawcolor': 'support.function',
        'linecolor': 'support.function',
        'fillcolor': 'support.function',
        'drawline': 'support.function',
        'line': 'support.function',
        'drawcircle': 'support.function',
        'circle': 'support.function',
        'fillcircle': 'support.function',
        'drawrect': 'support.function',
        'rect': 'support.function',
        'fillrect': 'support.function',
        'drawdot': 'support.function',
        'dot': 'support.function',
        'clearscreen': 'support.function',
        'clear': 'support.function',
        'drawscreen': 'support.function',
        'width': 'support.function',
        'height': 'support.function',

        'sin': 'support.function',
        'cos': 'support.function',
        'tan': 'support.function',
        'sqr': 'support.function',
        'abs': 'support.function',

        'min': 'support.function',
        'max': 'support.function',

        'hours': 'support.function',
        'minutes': 'support.function',
        'seconds': 'support.function',
        'milliseconds': 'support.function',

        'keydown': 'support.function',
        'keyup': 'support.function',
        'keyhit': 'support.function',
        'mousex': 'support.function',
        'mousey': 'support.function',
        'mousedown': 'support.function',
        
        'print': 'support.function',

        'int': 'support.function',


        'integer': 'support.type',
        'double': 'support.type',
        'number': 'support.type',
        'string': 'support.type',

    };
    this.indentEffect = {
        'for': 1,
        'next': -1,

        'do': 1,
        'loop': -1,

        'if': 1,
        'endif': -1,

        'function': 1,
        'endfunction': -1,

        'sub': 1,
        'endsub': -1
    };
}

CustomTokenizer.prototype = {
    getIndent: function(line, state) {
        var tokens = [];
        this.lexer.input = line;

        var total = 0;

        do {
            var token = this.lexer.next();

            if(this.indentEffect[token.type] !== undefined) {
                total += this.indentEffect[token.type];
            }
        } while(token.type != 'eos' && token !== null);

        return total;
    },

    getLineTokens: function(line, state, row) {
        var tokens = [];
        this.lexer.input = line;

        do {
            var token = this.lexer.next();
            if(token.code !== undefined) {
                var type = this.tokenTypes[token.type];

                if(token.type == 'identifier') {
                    type = this.specialIdentifiers[token.val.toLowerCase()];
                }

                tokens.push({ type: type || '', value: token.code });
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

    this.getNextLineIndent = function(state, line, tab) {
        var tokenizer = this.getTokenizer();

        var addition = '';
        if(tokenizer.getIndent(line, state) > 0) {
            addition = tab;
        }

        return this.$getIndent(line) + addition;
    };

    this.checkOutdent = function(line, input) {
        return true;
    };

    this.autoOutdent = function(state, doc, row) {
        if(row == 0) {
            return;
        }

        var tokenizer = this.getTokenizer();

        var line = doc.getLine(row);
        var lastLine = doc.getLine(row - 1);
        var indent = this.$getIndent(line);

        if(tokenizer.getIndent(line, state) < 0) {
            var newIndent = this.$getIndent(lastLine);
            
            if(tokenizer.getIndent(lastLine, 'start') <= 0) {
                newIndent = newIndent.substr(4);
            }

            doc.replace(new Range(row, 0, row, indent.length), newIndent);
        }
    };
};
oop.inherits(Mode, TextMode);

(function() {

}).call(Mode.prototype);

exports.Mode = Mode;
});

/// <reference path="polyfill.js" />
/// <reference path="types.js" />

function OperatorContainer(types) {
    /// <param name='types' type='TypeContainer' />
    this.operators = [];
    this.tokensByPriority = [];
    this.types = types;
}

OperatorContainer.prototype = {
    addOperator: function addOperator(operator) {
        /// <param name='operator' type='BinaryOperator' />
        this.operators.push(operator);
    },
    addToken: function addToken(priority, token, chainable) {
        /// <param name='priority' type='Number' integer='true' />
        /// <param name='token' type='String' />
        /// <param name='chainable' type='Boolean' />
        if (!this.tokensByPriority[priority]) {
            this.tokensByPriority[priority] = [];
            this.tokensByPriority[priority].chainable = chainable;
        }
        this.tokensByPriority[priority].push(token);
        if (this.tokensByPriority[priority].chainable != chainable)
            throw new Error('A missmatch with token chainability! All tokens with the same priority must have the same chainability.');
    },

    addDefaultOperators: function addDefaultOperators() {
        /// <summary>Adds default operators and tokens to operator container.</summary>

        // Tokens
        this.addToken(0, 'or', true);
        this.addToken(0, 'and', true);
        this.addToken(0, 'xor', true);

        this.addToken(1, 'eq', false);
        this.addToken(1, 'neq', false);
        this.addToken(1, 'lt', false);
        this.addToken(1, 'lte', false);
        this.addToken(1, 'gt', false);
        this.addToken(1, 'gte', false);

        this.addToken(2, 'concat', true);

        this.addToken(3, 'plus', true);
        this.addToken(3, 'minus', true);

        this.addToken(4, 'mul', true);
        this.addToken(4, 'div', true);
        this.addToken(4, 'idiv', true);
        this.addToken(4, 'mod', true);
        this.addToken(4, 'pow', true);

        // Boolean operators
        var operators = {
            'or': '|',
            'and': '&',
            'xor': '^'
        };
        for (var op in operators) {
            if (operators.hasOwnProperty(op)) {
                this.addOperator(new BinaryOperator(this.types.Boolean, op, this.types.Boolean, this.types.Boolean,
                    new BinaryOperatorCompiler(operators[op], this.types.Boolean, this.types.Boolean, this.types.Boolean, true)));
            }
        }

        // Comparison operators
        var operators = {
            'eq': '==',
            'neq': '!=',
            'lt': '<',
            'lte': '<=',
            'gt': '>',
            'gte': '>='
        };
        for (var op in operators) {
            if (operators.hasOwnProperty(op)) {
                this.addOperator(new BinaryOperator(this.types.Double, op, this.types.Double, this.types.Boolean,
                    new BinaryOperatorCompiler(operators[op], this.types.Double, this.types.Double, this.types.Boolean, true)));

                this.addOperator(new BinaryOperator(this.types.Integer, op, this.types.Integer, this.types.Boolean,
                    new BinaryOperatorCompiler(operators[op], this.types.Integer, this.types.Integer, this.types.Boolean, true)));

                this.addOperator(new BinaryOperator(this.types.String, op, this.types.String, this.types.Boolean,
                    new BinaryOperatorCompiler(operators[op], this.types.String, this.types.String, this.types.Boolean, true)));
            }
        }

        // Mathematical operators
        var operators = {
            'plus': '+',
            'minus': '-',
            'mod': '%'
        };
        for (var op in operators) {
            if (operators.hasOwnProperty(op)) {
                this.addOperator(new BinaryOperator(this.types.Integer, op, this.types.Integer, this.types.Integer,
                    new BinaryOperatorCompiler(operators[op], this.types.Integer, this.types.Integer, this.types.Integer, true)));

                this.addOperator(new BinaryOperator(this.types.Double, op, this.types.Integer, this.types.Double,
                    new BinaryOperatorCompiler(operators[op], this.types.Double, this.types.Double, this.types.Double, true)));

                this.addOperator(new BinaryOperator(this.types.Integer, op, this.types.Double, this.types.Double,
                    new BinaryOperatorCompiler(operators[op], this.types.Double, this.types.Double, this.types.Double, true)));

                this.addOperator(new BinaryOperator(this.types.Double, op, this.types.Double, this.types.Double,
                    new BinaryOperatorCompiler(operators[op], this.types.Double, this.types.Double, this.types.Double, true)));
            }
        }
        // Multiplication
        this.addOperator(new BinaryOperator(this.types.Integer, 'mul', this.types.Integer, this.types.Integer,
            new BinaryOperatorCompiler('imul', this.types.Integer, this.types.Integer, this.types.Integer, false)));

        this.addOperator(new BinaryOperator(this.types.Double, 'mul', this.types.Integer, this.types.Double,
            new BinaryOperatorCompiler('*', this.types.Double, this.types.Double, this.types.Double, true)));

        this.addOperator(new BinaryOperator(this.types.Integer, 'mul', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('*', this.types.Double, this.types.Double, this.types.Double, true)));

        this.addOperator(new BinaryOperator(this.types.Double, 'mul', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('*', this.types.Double, this.types.Double, this.types.Double, true)));
        // Divison
        this.addOperator(new BinaryOperator(this.types.Double, 'div', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('/', this.types.Double, this.types.Double, this.types.Double, true)));

        this.addOperator(new BinaryOperator(this.types.Integer, 'idiv', this.types.Integer, this.types.Integer,
            new BinaryOperatorCompiler('/', this.types.Integer, this.types.Integer, this.types.Integer, true)));

        // Power
        this.addOperator(new BinaryOperator(this.types.Integer, 'pow', this.types.Integer, this.types.Double,
            new BinaryOperatorCompiler('__pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Double, 'pow', this.types.Integer, this.types.Double,
            new BinaryOperatorCompiler('__pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Integer, 'pow', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('__pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Double, 'pow', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('__pow', this.types.Double, this.types.Double, this.types.Double, false)));

        // Unary operators
        this.addOperator(new UnaryOperator(this.types.Integer, 'minus', this.types.Integer,
            new UnaryOperatorCompiler('-', this.types.Integer, this.types.Integer, false)));
        this.addOperator(new UnaryOperator(this.types.Double, 'minus', this.types.Double,
            new UnaryOperatorCompiler('-', this.types.Double, this.types.Double, false)));

        // String operators
        this.addOperator(new BinaryOperator(this.types.String, 'concat', this.types.String, this.types.String,
           new BinaryOperatorCompiler('__concat', this.types.String, this.types.String, this.types.String, false)));
    },

    getTokensByPriority: function getTokensByPriority(priority) {
        /// <returns type='Array' elementType='String'>
        return this.tokensByPriority[priority];
    },

    getOperatorByType: function getOperatorByType(leftType, opTokenType, rightType) {
        /// <returns type='BinaryOperator' />
        if (!rightType) {
            // Trying to find an unary op
            // First try exact match
            var op = this.operators.find(function find(operator) {
                /// <param name='operator' type='UnaryOperator' />
                return operator.type === 'unary'
                    && leftType === operator.inputType
                    && opTokenType === operator.opTokenType;
            });
            if (op)
                return op;
            // If not found, try with casting
            return this.operators.find(function find(operator) {
                /// <param name='operator' type='UnaryOperator' />
                return operator.type === 'unary'
                    && leftType.canCastTo(operator.inputType)
                    && opTokenType === operator.opTokenType;
            });
        }

        // Binary op
        // First try exact match
        var op = this.operators.find(function find(operator) {
            /// <param name='operator' type='BinaryOperator' />
            return operator.type === 'binary'
                && leftType === operator.leftType
                && opTokenType === operator.opTokenType
                && rightType === operator.rightType;
        });
        if (op)
            return op;
        // If not found, try with casting
        return this.operators.find(function find(operator) {
            /// <param name='operator' type='BinaryOperator' />
            return operator.type === 'binary'
                && leftType.canCastTo(operator.leftType)
                && opTokenType === operator.opTokenType
                && rightType.canCastTo(operator.rightType);
        });
    }
};

function BinaryOperator(leftType, opTokenType, rightType, returnType, compiler) {
    this.leftType = leftType;
    this.opTokenType = opTokenType;
    this.rightType = rightType;
    this.returnType = returnType;
    this.compiler = compiler;
}
BinaryOperator.prototype = {
    type: 'binary'
};

function BinaryOperatorCompiler(func, leftType, rightType, returnType, infix) {
    this.func = func;
    this.leftType = leftType;
    this.rightType = rightType;
    this.returnType = returnType;
    this.infix = infix;
}


function UnaryOperator(inputType, opTokenType, returnType, compiler) {
    this.inputType = inputType;
    this.opTokenType = opTokenType;
    this.returnType = returnType;
    this.compiler = compiler;
}
UnaryOperator.prototype = {
    type: 'unary'
};
function UnaryOperatorCompiler(func, inputType, returnType, call) {
    this.func = func;
    this.inputType = inputType;
    this.returnType = returnType;
    this.call = call;
}
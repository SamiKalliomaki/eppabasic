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
        //this.addOperator(new BinaryOperator(Types.Boolean, 'or', Types.Boolean, Types.Boolean, new BinaryOperatorCompiler('|', Types.Boolean, Types.Boolean, Types.Boolean, true)));
        //this.addOperator(new BinaryOperator(Types.Boolean, 'and', Types.Boolean, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Boolean, 'xor', Types.Boolean, Types.Boolean));

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
        //this.addOperator(new BinaryOperator(Types.Integer, 'eq', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'eq', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'eq', Types.String, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Integer, 'neq', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'neq', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'neq', Types.String, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Integer, 'lt', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'lt', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'lt', Types.String, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Integer, 'lte', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'lte', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'lte', Types.String, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Integer, 'gt', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'gt', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'gt', Types.String, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Integer, 'gte', Types.Integer, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.Double, 'gte', Types.Double, Types.Boolean));
        //this.addOperator(new BinaryOperator(Types.String, 'gte', Types.String, Types.Boolean));

        // String concatenation
        // TODO Add back string concatenation
        //this.addOperator(new BinaryOperator(Types.String, 'concat', Types.String, Types.String));
        //this.addOperator(new BinaryOperator(Types.Integer, 'concat', Types.String, Types.String));
        //this.addOperator(new BinaryOperator(Types.String, 'concat', Types.Integer, Types.String));
        //this.addOperator(new BinaryOperator(Types.Integer, 'concat', Types.Integer, Types.String));
        //this.addOperator(new BinaryOperator(Types.Double, 'concat', Types.String, Types.String));
        //this.addOperator(new BinaryOperator(Types.String, 'concat', Types.Double, Types.String));
        //this.addOperator(new BinaryOperator(Types.Double, 'concat', Types.Double, Types.String));

        // Mathematical operators
        var operators = {
            'plus': '+',
            'minus': '-',
            'div': '/',
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
        // Power
        this.addOperator(new BinaryOperator(this.types.Integer, 'pow', this.types.Integer, this.types.Double,
            new BinaryOperatorCompiler('pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Double, 'pow', this.types.Integer, this.types.Double,
            new BinaryOperatorCompiler('pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Integer, 'pow', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('pow', this.types.Double, this.types.Double, this.types.Double, false)));

        this.addOperator(new BinaryOperator(this.types.Double, 'pow', this.types.Double, this.types.Double,
            new BinaryOperatorCompiler('pow', this.types.Double, this.types.Double, this.types.Double, false)));

        //this.addOperator(new BinaryOperator(Types.Integer, 'plus', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'plus', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'plus', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'plus', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'minus', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'minus', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'minus', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'minus', Types.Double, Types.Double));

        // Multiplicative operators
        //this.addOperator(new BinaryOperator(Types.Integer, 'mul', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'mul', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'mul', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'mul', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'div', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'div', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'div', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'div', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'mod', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'mod', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'mod', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'mod', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'pow', Types.Integer, Types.Integer));
        //this.addOperator(new BinaryOperator(Types.Double, 'pow', Types.Integer, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Integer, 'pow', Types.Double, Types.Double));
        //this.addOperator(new BinaryOperator(Types.Double, 'pow', Types.Double, Types.Double));
    },

    getTokensByPriority: function getTokensByPriority(priority) {
        /// <returns type='Array' elementType='String'>
        return this.tokensByPriority[priority];
    },

    getOperatorByType: function getOperatorByType(leftType, opTokenType, rightType) {
        /// <returns type='BinaryOperator' />
        // First try exact match
        var op = this.operators.find(function find(operator) {
            /// <param name='operator' type='BinaryOperator' />
            return leftType === operator.leftType
                && opTokenType === operator.opTokenType
                && rightType === operator.rightType;
        });
        if (op)
            return op;
        // If not found, try with casting
        return this.operators.find(function find(operator) {
            /// <param name='operator' type='BinaryOperator' />
            return leftType.canCastTo(operator.leftType)
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

};

function BinaryOperatorCompiler(func, leftType, rightType, returnType, infix) {
    this.func = func;
    this.leftType = leftType;
    this.rightType = rightType;
    this.returnType = returnType;
    this.infix = infix;
}
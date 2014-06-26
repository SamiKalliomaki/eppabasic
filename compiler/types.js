Types = {};

(function initTypes() {

    function Integer() { };
    Integer.prototype = {
        canCastImplicitlyTo: function canCastImplicitlyTo(type) {
            switch (type) {
                case Types.Integer:
                case Types.Double:
                    return true;
            }
            return false;
        },
        cast: function cast(expr) {
            return '((' + expr + ')|0)';
        },
        castTo: function castTo(expr, type) {
            switch (type) {
                case Types.Integer:
                    return '((' + expr + ')|0)';
                case Types.Double:
                    return '(+(' + expr + '))';
            }
            throw new Error('Failed to perform type casting');
        },
        memoryType: 'MEMS32',
        shift: 2,
        size: 4,
        toString: function toString() {
            return 'Integer';
        }
    };

    function Boolean() { };
    Boolean.prototype = {
        canCastImplicitlyTo: function canCastImplicitlyTo(type) {
            switch (type) {
                case Types.Integer:
                case Types.Double:
                    return true;
            }
            return false;
        },
        cast: function cast(expr) {
            return '((' + expr + ')|0)';
        },
        memoryType: 'MEMS32',
        shift: 2,
        size: 4,
        toString: function toString() {
            return 'Boolean';
        }
    };

    function Double() { };
    Double.prototype = {
        canCastImplicitlyTo: function canCastImplicitlyTo(type) {
            switch (type) {
                case Types.Double:
                    return true;
            }
            return false;
        },
        cast: function cast(expr) {
            return '(+(' + expr + '))';
        },
        castTo: function castTo(expr, type) {
            switch (type) {
                case Types.Integer:
                    return '(~~(' + expr + '))';
                case Types.Double:
                    return '(+(' + expr + '))';
            }
            throw new Error('Failed to perform type casting');
        },
        memoryType: 'MEMF32',
        shift: 2,
        size: 4,
        toString: function toString() {
            return 'Double';
        }
    };

    function String() { }
    String.prototype = {
        canCastImplicitlyTo: function canCastImplicitlyTo(type) {
            switch (type) {
                case Types.String:
                    return true;
            }
            return false;
        },
        cast: function (expr) {
            return '((' + expr + ')|0)';
        },
        pointer: true,

        memoryType: 'MEMU32',
        shift: 2,
        size: 4,
        toString: function toString() {
            return 'String';
        }
    };

    function Char() { }
    Char.prototype = {
        canCastImplicitlyTo: function canCastImplicitlyTo(type) {
            switch (type) {
                case Types.Integer:
                case Types.Double:
                    return true;
            }
            return false;
        },
        cast: function cast(expr) {
            return '((' + expr + ')|0)';
        },
        memoryType: 'MEMU8',
        shift: 0,
        size: 1,
        toString: function toString() {
            return 'Char';
        }
    }

    // Make singletones from types
    Types.Integer = new Integer();
    Types.Boolean = new Boolean();
    Types.Double = new Double();
    Types.String = new String();
    Types.Char = new Char();
})();

Types.toType = function toType(type) {
    for (ownType in this) {
        if (this.hasOwnProperty(ownType)) {
            if (type.toLowerCase() === ownType.toLowerCase())
                return this[ownType];
        }
    }

    throw new Error('Unknown type: "' + type + '"');
}
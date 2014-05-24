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
        memoryType: 'MEMS32',
        shift: 2,
        size: 4
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
        memoryType: 'MEMF32',
        shift: 2,
        size: 4
    };

    // Make singletones from types
    Types.Integer = new Integer();
    Types.Double = new Double();
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
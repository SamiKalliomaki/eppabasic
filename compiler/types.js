

function TypeContainer() {
    this.types = [];
    this.arrayTypes = [];

    // Make common singletones easily available
    this.Integer = new IntegerType();

    // Add singletones to known types
    this.types.push(this.Integer);
}
TypeContainer.prototype = {
    getTypeByName: function getTypeByName(name) {
        return this.types.find(function find(type) {
            return type.name.toLowerCase() === name.toLowerCase();
        }.bind(this));
    },
    getArrayType: function getArrayType(type, dimensionCount) {
        var array = this.arrayTypes.find(function find(arr) {
            return arr.itemType === type && arr.dimensionCount === dimensionCount;
        })
        if (array)
            return array;
        array = new ArrayType(type, dimensionCount);
        this.types.push(array);
        this.arrayTypes.push(array);
        return array;
    }
};

function BaseType() {
}
BaseType.prototype = {
    canCastTo: function canCastTo(type) {
        if (this === type)
            return true;
        return this.castTargets.some(function some(val) {
            return type === val;
        });
    },
    isArray: function isArray() {
        return false;
    },
    castTargets: [],
    toString: function toString() {
        return this.name;
    }
};


function IntegerType() {

}
extend(IntegerType.prototype, BaseType.prototype);
IntegerType.prototype.castTargets = [];
IntegerType.prototype.name = 'Integer';
IntegerType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
    }
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
}


function ArrayType(itemType, dimensionCount) {
    this.itemType = itemType;
    this.dimensionCount = dimensionCount;
    this.name = itemType + '(' + dimensionCount + ')';
}
extend(ArrayType.prototype, BaseType.prototype);
ArrayType.prototype.isArray = function isArray() {
    return true;
};
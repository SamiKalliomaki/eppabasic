

function TypeContainer() {
    this.types = [];
    this.arrayTypes = [];

    this.types.push(this.Integer);
    this.types.push(this.Double);
    this.types.push(this.Boolean);
    this.types.push(this.String);
}
TypeContainer.prototype = {
    getTypeByName: function getTypeByName(name) {
        if (name.toLowerCase() === 'number')
            return this.Double;             // Number is an alias for Double

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
    },

    // Make common singletones easily available
    Integer: new IntegerType(),
    Double: new DoubleType,
    Boolean: new BooleanType(),
    String: new StringType()
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
    cast: function cast(expr) {
        return '((' + expr + ')|0)';
    },
    isArray: function isArray() {
        return false;
    },
    castTargets: [],
    toString: function toString() {
        return this.name;
    }
};


function IntegerType() { }
extend(IntegerType.prototype, BaseType.prototype);
IntegerType.prototype.castTargets = [TypeContainer.prototype.Double];
IntegerType.prototype.name = 'Integer';
IntegerType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
        case TypeContainer.prototype.Double:
            return '(+(' + expr + '))';
    }
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
}

function DoubleType() { }
extend(DoubleType.prototype, BaseType.prototype);
DoubleType.prototype.castTargets = [TypeContainer.prototype.Integer];
DoubleType.prototype.name = 'Double';
DoubleType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
        case TypeContainer.prototype.Integer:
            return '((~~+(' + expr + '))|0)';
    }
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
}
DoubleType.prototype.cast = function cast(expr) {
    return '(+(' + expr + '))';
};


function BooleanType() { }
extend(BooleanType.prototype, BaseType.prototype);
BooleanType.prototype.castTargets = [];
BooleanType.prototype.name = 'Boolean';
BooleanType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
    }
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
}

function StringType() { }
extend(StringType.prototype, BaseType.prototype);
StringType.prototype.castTargets = [];
StringType.prototype.name = 'String';
StringType.prototype.castTo = function castTo(expr, type) {
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

    this.elementShift = 2;
    this.dataOffset = 4 * dimensionCount;
    if (itemType === TypeContainer.prototype.Double) {
        this.elementShift = 3;
        while (this.dataOffset % 8 !== 0) this.dataOffset++;
    }
}
extend(ArrayType.prototype, BaseType.prototype);
ArrayType.prototype.isArray = function isArray() {
    return true;
};
ArrayType.prototype.castTo = function castTo(expr, type) {
    if (type === this)
        return expr;
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
};
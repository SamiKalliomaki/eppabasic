/// <reference path="compiler.js" />


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
    free: function free(ref, context) { },
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
    clone: function clone(ref, context) {
        if (ref.type !== this)
            throw new Error('A reference to be cloned must match the type of the cloner');
        ref.refCount++;
        return ref;
    },
    toString: function toString() {
        if (this.aliasName)
            return this.aliasName;
        return this.name;
    }
};


function IntegerType() { }
extend(IntegerType.prototype, BaseType.prototype);
IntegerType.prototype.castTargets = [TypeContainer.prototype.Double, TypeContainer.prototype.String];
IntegerType.prototype.name = 'Integer';
IntegerType.prototype.aliasName = 'Number';
IntegerType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
        case TypeContainer.prototype.Double:
            return '(+(' + expr + '))';
        case TypeContainer.prototype.String:
            return '(__integerstring((' + expr + ')|0)|0)';
    }
    throw new Error('Failed to cast "' + this + '" to "' + type + '"');
}

function DoubleType() { }
extend(DoubleType.prototype, BaseType.prototype);
DoubleType.prototype.castTargets = [TypeContainer.prototype.Integer, TypeContainer.prototype.String];
DoubleType.prototype.name = 'Double';
DoubleType.prototype.aliasName = 'Number';
DoubleType.prototype.castTo = function castTo(expr, type) {
    /// <param name='expr' type='String' />
    /// <param name='type' type='BaseType' />
    switch (type) {
        case this:
            return expr;
        case TypeContainer.prototype.Integer:
            return '((~~+(' + expr + '))|0)';
        case TypeContainer.prototype.String:
            return '(__doublestring(+(' + expr + '))|0)';
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
StringType.prototype.free = function free(ref, context) {
    // Just free the string
    context.push('if((' + ref.getValue() + ')|0){')
    context.push('__memfree((' + ref.getValue() + ')|0);');
    context.push('}');
}
StringType.prototype.clone = function clone(ref, context) {
    if (ref.type !== this)
        throw new Error('A reference to be cloned must match the type of the cloner');

    var res = context.reserveTemporary(this);
    var origSizeRef = new CompilerAbsoluteReference(TypeContainer.prototype.Integer, ref, context);

    // Reserve the right amount of memory
    var cnt = context.reserveConstant(this);
    cnt.setValue('__memreserve((' + origSizeRef.getValue() + '+(STRING_HEADER_LENGTH|0))|0)|0');
    res.setValue(cnt);

    // Then set the size
    var resSizeRef = new CompilerAbsoluteReference(TypeContainer.prototype.Integer, res, context);
    resSizeRef.setValue(origSizeRef);

    // And then copy the payload
    var indexRef = context.reserveTemporary(TypeContainer.prototype.Integer);
    cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue('0');
    indexRef.setValue(cnt);

    context.push('while((' + indexRef.getValue() + '<' + resSizeRef.getValue() + ')|0){');
    context.push('MEMU8[(' + res.getValue() + '+' + indexRef.getValue() + '+(STRING_HEADER_LENGTH|0))>>0]=MEMU8[(' + ref.getValue() + '+' + indexRef.getValue() + '+(STRING_HEADER_LENGTH|0))>>0];')
    // Increase index
    cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue(indexRef.getValue() + '+1');
    indexRef.setValue(cnt);

    context.push('}');

    indexRef.freeRef();
    indexRef.freeVal();

    return res;
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
ArrayType.prototype.free = function free(ptr, context) {
    /// <param name='context' type='CompilerContext' />
    context.push('/*Freeing array of type ' + this + '*/');
    // Compute the size
    var offset = context.reserveConstant(TypeContainer.prototype.Integer);
    offset.setValue(ptr.getValue());
    var ref = new CompilerAbsoluteReference(TypeContainer.prototype.Integer, offset, context);
    var sizeStr = ref.getValue();
    for (var i = 1; i < this.dimensionCount; i++) {
        offset.setValue(ptr.getValue() + '+' + (4 * i));
        ref = new CompilerAbsoluteReference(TypeContainer.prototype.Integer, offset, context);
        sizeStr = '(__imul(' + sizeStr + ',' + ref.getValue() + ')|0)';
    }

    var cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue(sizeStr);
    var sizeRef = context.reserveTemporary(TypeContainer.prototype.Integer);
    sizeRef.setValue(cnt);
    cnt.freeRef();
    var indexRef = context.reserveTemporary(TypeContainer.prototype.Integer);
    cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue('0');
    indexRef.setValue(cnt);
    cnt.freeRef();

    context.push('while((' + indexRef.getValue() + '<' + sizeRef.getValue() + ')|0){');
    cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue(ptr.getValue() + '+' + this.dataOffset + '+((' + indexRef.getValue() + ')<<' + this.elementShift + ')');
    var abs = new CompilerAbsoluteReference(this.itemType, cnt, context);
    abs.freeVal();
    abs.freeRef();
    cnt.freeRef();

    // Increase index
    cnt = context.reserveConstant(TypeContainer.prototype.Integer);
    cnt.setValue(indexRef.getValue() + '+1');
    indexRef.setValue(cnt);
    cnt.freeRef();

    context.push('}');


    indexRef.freeVal();
    indexRef.freeRef();
    sizeRef.freeVal();
    sizeRef.freeRef();

    // Finally free the whole array
    context.push('__memfree((' + ptr.getValue() + ')|0);');
}
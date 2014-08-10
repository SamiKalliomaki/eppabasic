define(function () {
    function CompilerConstantReference(type, context) {
        /// <param name='type' type='BaseType' />
        /// <param name='context' type='CompilerContext' />
        this.type = type;
        this.context = context;
        this.refCount = 1;
    }
    CompilerConstantReference.prototype = {
        setValue: function setValue(value, context) {
            if (!context)
                context = this.context;
            if (typeof value !== "string")
                value = value.getValue();
            this.value = value;
        },
        getValue: function getValue() {
            return this.type.cast(this.value);
        },
        freeRef: function freeRef(real) { },
        refType: 'const'
    };

    return CompilerConstantReference;
});
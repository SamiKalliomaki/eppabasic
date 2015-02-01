define(['./basereference'], function (BaseReference) {
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

            this.value = this.castValue(value, this.type);
        },
        getValue: function getValue() {
            return this.value;
        },
        freeRef: function freeRef(real) { },
        refType: 'const'
    };

    extend(CompilerConstantReference.prototype, BaseReference.prototype);

    return CompilerConstantReference;
});
define(['./basereference'], function (BaseReference) {
    function CompilerTemporaryReference(type, name, context) {
        /// <param name='type' type='BaseType' />
        /// <param name='name' type='String' />
        /// <param name='context' type='CompilerContext' />
        this.type = type;
        this.name = name;
        this.context = context;
        this.used = false;
        this.refCount = 1;
    }
    CompilerTemporaryReference.prototype = {
        setValue: function setValue(value, context) {
            if (!context)
                context = this.context;

            var code = this.name + '=' + this.castValue(value, this.type) + ';';

            context.push(code);
        },
        getValue: function getValue() {
            return this.type.cast(this.name);
        },
        freeRef: function freeRef(real) {
            if (real !== false)
                real = true;
            if (!this.refCount)
                throw new Error('No reference to free');

            if (real) {
                this.refCount--;
            }
        },
        refType: 'temp'
    };

    extend(CompilerTemporaryReference.prototype, BaseReference.prototype);

    return CompilerTemporaryReference;
});
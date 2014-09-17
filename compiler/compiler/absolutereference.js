define(function () {
    function CompilerAbsoluteReference(type, offset, context) {
        /// <param name='type' type='BaseType' />
        /////// <param name='offset' type='Number' />
        /// <param name='context' type='CompilerContext' />
        this.type = type;
        this.offset = offset;
        this.context = context;
        this.types = this.context.types;
        this.refCount = 1;
    }
    CompilerAbsoluteReference.prototype = {
        setValue: function setValue(value, context) {
            if (!context)
                context = this.context;
            var mem = 'MEMS32';
            var shift = 2;
            if (this.type === this.types.Double) {
                mem = 'MEMF64';
                shift = 3;
            }
            if (typeof value !== "string")
                value = value.type.castTo(value.getValue(), this.type);
            else
                value = this.type.cast(value);
            context.push(mem + '[((' + this.offset.getValue() + ')|0)>>' + shift + ']=' + value + ';');
        },
        getValue: function getValue() {
            var mem = 'MEMS32';
            var shift = 2;
            if (this.type === this.types.Double) {
                mem = 'MEMF64';
                shift = 3;
            }
            return this.type.cast(mem + '[((' + this.offset.getValue() + ')|0)>>' + shift + ']');
        },
        freeRef: function freeRef(real) {
            if (real !== false)
                real = true;
            if (!this.refCount)
                throw new Error('No reference to free');
            if (real)
                this.refCount--;
        },
        refType: 'abs'
    };

    return CompilerAbsoluteReference;
});
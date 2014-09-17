define(['./memoryreference'], function (MemoryReference) {
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
        getMem: function() {
            return this.getMemByOffset(this.offset);
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

    extend(CompilerAbsoluteReference.prototype, MemoryReference.prototype);

    return CompilerAbsoluteReference;
});
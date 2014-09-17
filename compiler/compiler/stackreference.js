define(['./memoryreference'], function (MemoryReference) {
    function CompilerStackReference(type, offset, reserved, context) {
        /// <param name='type' type='BaseType' />
        /// <param name='offset' type='Number' />
        /// <param name='reserved' type='Number' />
        /// <param name='context' type='CompilerContext' />
        this.type = type;
        this.offset = offset;
        this.reserved = reserved;
        this.context = context;
        this.types = this.context.types;
        this.refCount = 1;
    }
    CompilerStackReference.prototype = {
        getMem: function(context) {
            return this.getMemByOffset('SP-' + (context.stackOffset - this.offset));
        },
        freeRef: function freeRef(real) {
            if (real !== false)
                real = true;
            if (!this.refCount)
                throw new Error('No reference to free');

            var size = 4;
            if (this.type === this.types.Double)
                size = 8;
            if (real && this.context.stackOffset - size !== this.offset)
                throw new Error('Stack popped in wrong order!');
            this.context.push('SP=(SP-' + this.reserved + ')|0;');
            if (real) {
                this.refCount--;
                if (!this.refCount)     // Was the last reference
                    this.context.stackOffset -= this.reserved;
            }
        },
        refType: 'stack'
    };

    extend(CompilerStackReference.prototype, MemoryReference.prototype);

    return CompilerStackReference;
})
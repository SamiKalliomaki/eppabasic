define(['./memoryreference'], function (MemoryReference) {

    function CompilerAbsoluteStackReference(type, offset, reserved, context) {
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
    CompilerAbsoluteStackReference.prototype = {
        getMem: function() {
            return this.getMemByOffset('SB+' + this.offset);
        },
        freeRef: function freeRef(real) {
        },
        refType: 'absstack'
    };

    extend(CompilerAbsoluteStackReference.prototype, MemoryReference.prototype);

    return CompilerAbsoluteStackReference;
});
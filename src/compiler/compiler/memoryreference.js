define(['./basereference'], function(BaseReference) {
    function MemoryReference() {
    }

    MemoryReference.prototype = {
        getMemByOffset: function(offset) {
            var mem = 'MEMS32';
            var shift = 2;
            if (this.type === this.types.Double) {
                mem = 'MEMF64';
                shift = 3;
            }

            var offsetCode;

            if(typeof offset !== "string") {
                offsetCode = this.castValue(offset, offset.type);
            } else {
                /* FIXME This is a terrible hack, why use type string for offset? :( */
                offsetCode = this.castValue(offset, this.types.Integer);
            }

            return mem + '[(' + offsetCode + ')>>' + shift + ']';
        },
        getValue: function() {
            return this.type.cast(this.getMem(this.context));
        },
        setValue: function(value, context) {
            if (!context)
                context = this.context;

            context.push(this.getMem(context) + '=' + this.castValue(value, this.type) + ';');
        }
    }

    extend(MemoryReference.prototype, BaseReference.prototype);

    return MemoryReference;
});
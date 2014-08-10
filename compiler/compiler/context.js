
define(['./absolutereference', './absolutestackreference', './constantreference', './stackreference', './temporaryreference'], function (CompilerAbsoluteReference, CompilerAbsoluteStackReference, CompilerConstantReference, CompilerStackReference, CompilerTemporaryReference) {
    function CompilerContext(types, entry, isMain) {
        /// <param name='types' type='TypeContainer' />
        /// <param name='entry' type='CompilerFunctionEntry' />
        this.types = types;
        this.func = entry;
        this.isMain = isMain;

        this.stackOffset = 0;
        this.temporaries = [];
        this.lastTemporary = 0;

        this.registeredVariables = [];
    }
    CompilerContext.prototype = {

        reserveTemporary: function reserveTemporary(type) {
            /// <param name='type' type='BaseType' />
            /// <returns type='CompilerTemporaryReference' />
            if (!type)
                throw new Error('Type must be specified');

            // First try to find if there is already an unused temporary of right type
            var tmp = this.temporaries.find(function find(tmp) {
                if (type === this.types.Double) {
                    return tmp.type === this.types.Double && tmp.refCount === 0;
                } else {
                    return tmp.type !== this.types.Double && tmp.refCount === 0;
                }
            }.bind(this));

            if (!tmp) {
                // No temporary found so let's create a new one
                var i = this.lastTemporary++;
                tmp = [];
                do {
                    tmp.push(String.fromCharCode(97 + i % 26));
                    i = (i / 26) | 0;
                } while (i > 0);
                tmp = tmp.join('');

                // Add this temporary to the context
                if (type === this.types.Double)
                    this.unshift('var ' + tmp + '=0.0;');
                else
                    this.unshift('var ' + tmp + '=0;');
                tmp = new CompilerTemporaryReference(type, tmp, this);
                this.temporaries.push(tmp);
            }

            // This temporary is ofcourse in use...
            tmp.refCount = 1;
            // ...and it must be of right type
            tmp.type = type;            // This is safe because it is either double or not

            return tmp;
        },

        reserveStack: function reserveStack(type) {
            /// <param name='type' type='BaseType' />
            /// <returns type='CompilerStackReference' />
            if (!type)
                throw new Error('Type must be specified');

            // Get the size of the type
            var size = 4;
            if (type === this.types.Double)
                size = 8;
            var reserved = size;
            // Align the value in memory
            while (this.stackOffset % size != 0) {
                reserved++;
                this.stackOffset++;
            }
            // Push it to the stack
            var offset = this.stackOffset;
            this.stackOffset += size;
            this.push('SP=(SP+' + reserved + ')|0;');

            if (this.isMain)
                return new CompilerAbsoluteStackReference(type, offset, reserved, this);
            else
                return new CompilerStackReference(type, offset, reserved, this);
        },

        reserveConstant: function reserveConstant(type) {
            /// <param name='type' type='BaseType' />
            /// <returns type='CompilerConstantReference' />
            return new CompilerConstantReference(type, this);
        },

        alignStack: function alignStack() {
            // Fill stack with nothing till next multiple of 8
            var reserved = 0;
            while (this.stackOffset % 8 != 0) {
                reserved++;
                this.stackOffset++;
            }
            if (reserved > 0)
                this.push('SP=(SP+' + reserved + ')|0;');
            return reserved;
        },
        revertAlign: function revertAlign(reserved) {
            this.stackOffset -= reserved;
            if (reserved > 0)
                this.push('SP=(SP-' + reserved + ')|0;');
        },

        setCallStack: function setCallStack(entry) {
            this.push('MEMU32[CP>>2]=' + entry.index + ';');
        },

        registerVariable: function registerVariable(ref) {
            this.registeredVariables.push(ref);
        },
        freeVariable: function freeVariable(ref) {
            if (this.registeredVariables.pop() !== ref)
                throw new Error('Registered variables freed in wrong order.');
            ref.freeVal();
            ref.freeRef();
        },
        freeAll: function freeAll(release) {
            if (release) {
                while (this.registeredVariables.length)
                    this.freeVariable(this.registeredVariables[this.registeredVariables.length - 1]);
            } else {
                var originalStackOffset = this.stackOffset;
                var i = this.registeredVariables.length;
                while (i--) {
                    this.registeredVariables[i].freeVal();
                    this.registeredVariables[i].freeRef(false);
                    // Pop the stack offset for the right alignment for the type freeing
                    if (this.registeredVariables[i].refType === 'stack' || this.registeredVariables[i].refType === 'absstack')
                        this.stackOffset -= this.registeredVariables[i].reserved;
                }
                // Revert the stack offset
                this.stackOffset = originalStackOffset;
            }
        },

        push: function push(str) {
            this.func.push(str);
        },
        unshift: function unshift(str) {
            this.func.unshift(str);
        },
        setCurrentFunction: function setCurrentFunction(entry) {
            this.func = entry;
            if (this.temporaries.some(function every(temp) { return temp.used; })) {
                console.error(this.temporaries);
                throw new Error('Not all temporaries are freed: ' + this.temporaries.map(function (tmp) { return tmp.name; }).join(', '));
            }
            this.temporaries = [];
            this.lastTemporary = 0;
            this.func = entry;
        }
    };

    return CompilerContext;
});
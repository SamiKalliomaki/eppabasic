/// <reference path="operators.js" />
/// <reference path="nodes.js" />
/// <reference path="types.js" />


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
                return tmp.type === this.types.Double && tmp.used === false;
            } else {
                return tmp.type !== this.types.Double && tmp.used === false;
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
        tmp.used = true;
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
            var i = this.registeredVariables.length;
            while (i--) {
                this.registeredVariables[i].freeType();
            }
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

function CompilerTemporaryReference(type, name, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='name' type='String' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.name = name;
    this.context = context;
    this.used = false;
}
CompilerTemporaryReference.prototype = {
    setValue: function setValue(value) {
        var code = this.name + '=' + value.type.castTo(value.getValue(), this.type) + ';';
        this.context.push(code);
    },
    getValue: function getValue() {
        return this.type.cast(this.name);
    },
    freeRef: function freeRef(real) {
        if (real !== false)
            real = true;
        if (real)
            this.used = false;
    },
    refType: 'temp'
};
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
}
CompilerStackReference.prototype = {
    setValue: function setValue(value) {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        this.context.push(mem + '[((SP-' + (this.context.stackOffset - this.offset) + ')|0)>>' + shift + ']=' + value.type.castTo(value.getValue(), this.type) + ';');
    },
    getValue: function getValue() {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        return this.type.cast(mem + '[((SP-' + (this.context.stackOffset - this.offset) + ')|0)>>' + shift + ']');
    },
    freeRef: function freeRef(real) {
        if (real !== false)
            real = true;

        var size = 4;
        if (this.type === this.types.Double)
            size = 8;
        if (real && this.context.stackOffset - size !== this.offset)
            throw new Error('Stack popped in wrong order!');
        this.context.push('SP=(SP-' + this.reserved + ')|0;');
        if (real)
            this.context.stackOffset -= this.reserved;
    },
    refType: 'stack'
};
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
}
CompilerAbsoluteStackReference.prototype = {
    setValue: function setValue(value) {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        this.context.push(mem + '[(SB+' + this.offset + '|0)>>' + shift + ']=' + value.type.castTo(value.getValue(), this.type) + ';');
    },
    getValue: function getValue() {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        return this.type.cast(mem + '[(SB+' + this.offset + '|0)>>' + shift + ']');
    },
    freeRef: function freeRef(real) {
        if (real !== false)
            real = true;

        var size = 4;
        if (this.type === this.types.Double)
            size = 8;
        if (real && this.context.stackOffset - size !== this.offset)
            throw new Error('Stack popped in wrong order!');
        this.context.push('SP=(SP-' + this.reserved + ')|0;');
        if (real)
            this.context.stackOffset -= this.reserved;
    },
    refType: 'absstack'
};
function CompilerAbsoluteReference(type, offset, context) {
    /// <param name='type' type='BaseType' />
    /////// <param name='offset' type='Number' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.offset = offset;
    this.context = context;
    this.types = this.context.types;
}
CompilerAbsoluteReference.prototype = {
    setValue: function setValue(value) {
        var mem = 'MEMS32';
        var shift = 2;
        if (this.type === this.types.Double) {
            mem = 'MEMF64';
            shift = 3;
        }
        this.context.push(mem + '[((' + this.offset.getValue() + ')|0)>>' + shift + ']=' + value.type.castTo(value.getValue(), this.type) + ';');
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
    },
    refType: 'abs'
};

function CompilerConstantReference(type, context) {
    /// <param name='type' type='BaseType' />
    /// <param name='context' type='CompilerContext' />
    this.type = type;
    this.context = context;
}
CompilerConstantReference.prototype = {
    setValue: function setValue(value) {
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
function CompilerNoFreeReference(ref) {
    extend(this, ref);
    this.freeVal = function () { };
    this.freeRef = function () { };
}

CompilerTemporaryReference.prototype.freeVal =
    CompilerStackReference.prototype.freeVal =
    CompilerAbsoluteStackReference.prototype.freeVal =
    CompilerAbsoluteReference.prototype.freeVal =
    CompilerConstantReference.prototype.freeVal =
    function freeVal() {
        this.type.free(this, this.context);
    };

function CompilerFunctionEntry(name, hasBody, paramTypes) {
    if (hasBody !== false)
        hasBody = true;
    if (!paramTypes)
        paramTypes = [];
    this.name = name;
    this.hasBody = hasBody;
    this.paramTypes = paramTypes;

    var paramStr = [];
    var paramCastStr = [];
    var paramI = 0;
    paramTypes.forEach(function each(param) {
        var name = CreateIthName(paramI++);
        paramStr.push(name);
        if (param.toString() === 'Double')
            paramCastStr.push(name + '=+' + name + ';');
        else
            paramCastStr.push(name + '=' + name + '|0;');
    }.bind(this));
    this.paramStr = paramStr.join(',');
    this.paramCastStr = paramCastStr.join('\n');
    this.nextFreeTemporary = paramI;
    this.paramNames = paramStr;

    if (hasBody) {
        this.buf = [];
    }
}
CompilerFunctionEntry.prototype = {
    push: function push(str) {
        if (!this.hasBody)
            throw new Error('Non-body function entry can not be added body');
        this.buf.push(str);
    },
    unshift: function unshift(str) {
        if (!this.hasBody)
            throw new Error('Non-body function entry can not be added body');
        this.buf.unshift(str);
    },
    toString: function toString() {
        return this.buf.join('\n');
    }
};

function Compiler(ast, operators, types) {
    /// <param name='operators' type='OperatorContainer' />
    /// <param name='types' type='TypeContainer' />
    this.ast = ast;
    this.operators = operators;
    this.types = types;

    this.env = [];
    this.functions = [];
    this.entryTypes = [];
    this.lastEntryName = 0;

    this.lastFunctionName = 0;

    this.findUserDefinedFunctions();
}

Compiler.prototype = {
    defineFunction: function defineFunction(name, parameterTypes, returnType) {
        //var entry = this.createEntry(jsName, true, parameterTypes, returnType, true);

        var handle = {
            name: name,
            paramTypes: parameterTypes,
            returnType: returnType,
            atomic: true,
            // entry: entry
        };
        this.functions.push(handle);
        return handle;
    },
    defineJsFunction: function defineJsFunction(jsName, env, name, parameterTypes, returnType, atomic) {
        if (atomic !== false)
            atomic = true;

        if (env) {
            // The implementation is found in env
            // Let's copy it to a new function name
            var asmname = this.generateFunctionName();
            var entry = this.createEntry(asmname, false, parameterTypes, returnType, false);
            this.env.push('var ' + asmname + '=' + jsName + ';');
            // And also create an native, alternative entry
            var altname = this.generateFunctionName();
            var altEntry = this.createEntry(altname, true, parameterTypes, returnType, true);
            // Set the index of the original to this alternative one
            entry.index = altEntry.index;

            // Create a string for calling parameters
            var callStr = altEntry.paramNames.map(function map(name, index) {
                if (parameterTypes[index] === this.types.Double)
                    return '+' + name;
                else
                    return name + '|0';
            }.bind(this)).join(',');
            // And call the original function
            if (returnType) {
                if (returnType === this.types.Double)
                    altEntry.push('return +' + asmname + '(' + callStr + ');');
                else
                    altEntry.push('return ' + asmname + '(' + callStr + ')|0;');
            } else {
                altEntry.push(asmname + '(' + callStr + ');');
            }
        } else {
            // The implementation is in a module so do nothing but create an entry
            var entry = this.createEntry(jsName, true, parameterTypes, returnType, false);
        }

        var handle = {
            name: name,
            paramTypes: parameterTypes,
            returnType: returnType,
            atomic: atomic,
            entry: entry
        };
        this.functions.push(handle);
        return handle;
    },

    createEntry: function createEntry(name, native, paramTypes, returnType, hasBody) {
        /// <returns type='CompilerFunctionEntry' />
        if (native !== false)
            native = true;
        if (!paramTypes)
            paramTypes = [];
        if (hasBody !== false)
            hasBody = true;
        var entry = new CompilerFunctionEntry(name, hasBody, paramTypes);

        if (native) {
            var entryList = this.findEntryList(paramTypes, returnType);

            if (!entryList) {
                entryList = [];
                entryList.paramTypes = paramTypes;
                entryList.returnType = returnType;
                entryList.name = '_' + CreateIthName(this.lastEntryName++);
                this.entryTypes.push(entryList);
            }

            entryList.push(entry);
            entry.index = entryList.length - 1;
        }

        return entry;
    },
    findEntryList: function findEntryLis(paramTypes, returnType) {
        return this.entryTypes.find(function find(entryList) {
            // Test that param type lists are the same
            if (entryList.paramTypes.length !== paramTypes.length)
                return false;
            if (entryList.returnType !== returnType)
                return false;
            for (var i = 0; i < entryList.paramTypes.length; i++) {
                if (entryList.paramTypes[i] !== paramTypes[i])
                    return false;
            }
            return true;
        }.bind(this));
    },
    generateFunctionName: function generateFunctionName() {
        return '$' + CreateIthName(this.lastFunctionName++);       // Every function name begins with $ to prevent confusion with temporaries
    },
    alignEntryLists: function alignEntryLists() {
        this.entryTypes.find(function find(entryList) {
            var mask = nextPowerOfTwo(entryList.length);
            while (entryList.length < mask)
                entryList.push(entryList[0]);       // Append with the first element as it doesn't really matter which function we use
            entryList.mask = mask ? mask - 1 : 0;
        }.bind(this));
    },
    generateFTable: function generateFTable() {
        return this.entryTypes.map(function (entryList) {
            return 'var ' + entryList.name + '=[' + entryList.map(
                function (entry) {
                    return entry.name;
                }).join(',') + '];'
        }).join('\n');
    },
    generateFunctions: function generateFunctions() {
        return this.entryTypes
            .reduce(function flatten(a, b) { return a.concat(b); })         // Flatten array
            .filter(function hasBody(entry) { return entry.hasBody; })      // Filter only ones with body
            .filter(function removeDoublicates(entry, i, array) {
                return i === array.length - 1 || array.indexOf(entry, i + 1) === -1;
            })
            .map(function map(entry) {
                return 'function ' + entry.name + '(' + entry.paramStr + '){\n' + entry.paramCastStr + entry.buf.join('\n') + '\n}';
            }).join('\n')
    },


    findUserDefinedFunctions: function findUserDefinedFunctions() {
        this.ast.nodes.forEach(function each(def) {
            if (def.nodeType === 'FunctionDefinition') {
                var paramTypes = def.params.map(function map(param) { return param.type; });
                def.handle = this.defineFunction(def.name, paramTypes, def.type);
                //throw new Error('User defined functions not supported yet');
            }
        }.bind(this));
    },

    // Actual code compilation
    compile: function compile() {
        // Create a special function which is used to break execution
        var breakEntry = this.createEntry('__break', undefined, undefined, this.types.Integer);
        breakEntry.push('CP=(CP-4)|0;');
        breakEntry.push('return 0;');
        // Create another special function which is used when execution is finished
        var endEntry = this.createEntry(this.generateFunctionName(), undefined, undefined, this.types.Integer);
        endEntry.push('return 0;');

        var userDefinedFunctions = [];

        // Compile user defined functions
        this.ast.nodes.forEach(function each(def) {
            if (def.nodeType === 'FunctionDefinition') {
                var paramTypes = def.params.map(function map(param) { return param.type; });
                var retType = def.type;
                if (!def.atomic)
                    retType = this.types.Integer;

                var entry = def.handle.entry = this.createEntry(this.generateFunctionName(), true, paramTypes, retType, true);
                var context = new CompilerContext(this.types, def.handle.entry, false);
                context.atomic = def.atomic;
                context.lastTemporary = entry.nextFreeTemporary;

                // Add parameter references
                for (var i = 0; i < def.params.length; i++) {
                    def.params[i].location = new CompilerTemporaryReference(def.params[i].type, CreateIthName(i), context);
                    if (!def.atomic) {
                        var stack = context.reserveStack(def.params[i].type);
                        stack.setValue(def.params[i].location);
                        def.params[i].location = stack;
                    }
                }

                if (!def.atomic)
                    context.push('CP=(CP+4)|0;');

                userDefinedFunctions.push({ def: def, context: context });
            }
        }.bind(this));

        // Compile main code
        var mainEntry = this.createEntry('MAIN', undefined, undefined, this.types.Integer);
        var mainContext = new CompilerContext(this.types, mainEntry, true);
        this.compileBlock(this.ast, mainContext);
        // Push end entry to call stack to signal that program has ended
        mainContext.push('MEMU32[CP>>2]=' + endEntry.index + ';');
        mainContext.push('return 1;');

        userDefinedFunctions.forEach(function (userFunction) {
            var def = userFunction.def;
            var context = userFunction.context;

            this.compileBlock(def.block, context);

            // Just an emergency return if no user defined
            if (def.type) {
                if (def.atomic) {
                    if (def.type === this.types.Double)
                        context.push('return 0.0;');
                    else
                        context.push('return 0;');
                } else {
                    var topref = new CompilerStackReference(def.type, 0, 0, context);
                    var val = context.reserveConstant(def.type);
                    if (def.type === this.types.Double)
                        val.setValue('0.0');
                    else
                        val.setValue('0');
                    topref.setValue(val);
                    context.push('CP=(CP-4)|0;');
                    context.push('return 1;');
                    //throw new Error('Non-atomic user defined functions not supported');
                }
            } else {
                if (!def.atomic) {
                    context.push('CP=(CP-4)|0;');
                    context.push('return 1;');
                }
            }
        }.bind(this));

        // No that everything is compiled we can align entry lists
        this.alignEntryLists();

        var buf = [];
        buf.push('function Program(stdlib,env,heap){');
        buf.push('"use asm";');
        buf.push('var MEMU8=new stdlib.Uint8Array(heap);');
        buf.push('var MEMS32=new stdlib.Int32Array(heap);');
        buf.push('var MEMU32=new stdlib.Uint32Array(heap);');
        buf.push('var MEMF64=new stdlib.Float64Array(heap);');
        buf.push('var imul=stdlib.Math.imul;');
        buf.push('var __pow=stdlib.Math.pow;');
        buf.push('var SP=0;');
        buf.push('var SB=0;');
        buf.push('var CP=0;');
        buf.push('var NEXT_BLOCK=0;');
        buf.push('var HEAP_END=0;');
        buf.push('var STRING_HEADER_LENGTH=4;')
        // Add compiler defined environmental variables
        buf.push(this.env.join('\n'));
        // Compile all the other functions
        buf.push('function __popCallStack(){CP=(CP-4)|0;}');
        buf.push('function __init(){__meminit(0x100000);SB=SP=__memreserve(1024)|0;CP=__memreserve(1024)|0;MEMU32[CP>>2]=' + mainEntry.index + ';}');
        var mainEntryList = this.findEntryList([], this.types.Integer);
        buf.push('function __next(){while(' + mainEntryList.name + '[MEMU32[CP>>2]&' + mainEntryList.mask + ']()|0);}');
        buf.push('function __breakExec(){CP=(CP+4)|0;MEMU32[CP>>2]=' + breakEntry.index + ';}');
        buf.push('function __int(a){a=a|0;return a|0;}');
        buf.push('function __sp(){return SP|0;}');
        buf.push('function __cp(){return CP|0;}');

        buf.push('function __concat(stra,strb){stra=stra|0;strb=strb|0;var alen=0;var blen=0;var clen=0;var strc=0;var ptr=0;var ptrc=0;alen=MEMS32[(stra|0)>>2]|0;blen=MEMS32[(strb|0)>>2]|0;clen=(alen+blen)|0;strc=__memreserve((clen+(STRING_HEADER_LENGTH|0))|0)|0;ptrc=(strc+(STRING_HEADER_LENGTH|0))|0;ptr=(stra+(STRING_HEADER_LENGTH|0))|0;MEMS32[(strc|0)>>2]=clen|0;while(alen|0){MEMU8[(ptrc|0)>>0]=MEMU8[(ptr|0)>>0];ptrc=(ptrc+1)|0;ptr=(ptr+1)|0;alen=(alen-1)|0;}ptr=(strb+(STRING_HEADER_LENGTH|0))|0;while(blen|0){MEMU8[(ptrc|0)>>0]=MEMU8[(ptr|0)>>0];ptrc=(ptrc+1)|0;ptr=(ptr+1)|0;blen=(blen-1)|0;}return strc|0;}');

        buf.push('function __meminit(size){size=size|0;while((size&7)|0)size=(size-1)|0;MEMS32[0>>2]=0;MEMS32[4>>2]=(size-8)|0;MEMS32[((size-8)|0)>>2]=0;NEXT_BLOCK=0;HEAP_END=size;}function __memreserve(size){size=size|0;var header=0;var footer=0;var i=0;size=(size+7)&0xfffffff8;size=(size+8)|0;header=__memfind(size|0)|0;footer=(header+(MEMS32[(header+4)>>2]|0))|0;if((size|0)<(MEMS32[((header|0)+4)>>2]|0)){MEMS32[((header|0)+4)>>2]=size;MEMS32[((header|0)+size)>>2]=header;MEMS32[((header|0)+size+4)>>2]=(footer-header-size)|0;MEMS32[footer>>2]=(header+size)|0;}MEMS32[(header+4)>>2]=MEMS32[(header+4)>>2]|1;header=(header+8)|0;size=(size-8)|0;for(i=0;(i|0)<(size|0);i=(i+1)|0){MEMS32[(header+i)>>2]=0;}return header|0;}function __memfind(size){size=size|0;while(1){if((MEMS32[((NEXT_BLOCK+4)|0)>>2]&1)==0){if((MEMS32[((NEXT_BLOCK+4)|0)>>2]|0)>=(size|0)){return NEXT_BLOCK|0;}}NEXT_BLOCK=(NEXT_BLOCK+(MEMS32[((NEXT_BLOCK+4)|0)>>2]|0))&0xfffffff8;if(((NEXT_BLOCK+8)|0)>=(HEAP_END|0))NEXT_BLOCK=0;}return 0;}function __memfree(ptr){ptr=ptr|0;ptr=(ptr-8)|0;MEMS32[(ptr+4)>>2]=MEMS32[(ptr+4)>>2]&0xfffffffe;__memcoalesce(ptr);}function __memcoalesce(header){header=header|0;var header2=0;var footer=0;var tmp=0;header2=(header+(MEMS32[(header+4)>>2]|0))|0;if((MEMS32[((header2+4)|0)>>2]&1)==0){MEMS32[((header+4)|0)>>2]=((MEMS32[((header+4)|0)>>2]|0)+(MEMS32[((header2+4)|0)>>2]|0));footer=(header+(MEMS32[(header+4)>>2]|0))|0;MEMS32[footer>>2]=header;}header2=MEMS32[header>>2]|0;if((MEMS32[((header2+4)|0)>>2]&1)==0){tmp=header;header=header2;header2=tmp;MEMS32[((header+4)|0)>>2]=((MEMS32[((header+4)|0)>>2]|0)+(MEMS32[((header2+4)|0)>>2]|0));footer=(header+(MEMS32[(header+4)>>2]|0))|0;MEMS32[footer>>2]=header;}NEXT_BLOCK=header;}');

        buf.push(this.generateFunctions());
        // Compile f-tables in the end
        buf.push(this.generateFTable());
        // Return functions
        buf.push('return {popCallStack: __popCallStack,init:__init,next:__next,breakExec:__breakExec,sp:__sp,cp:__cp,memreserve:__memreserve};');
        buf.push('}');

        return buf.join('\n');
    },

    // Compiles a block
    compileBlock: function compileBlock(block, context) {
        /// <param name='block' type='Nodes.Block' />
        /// <param name='context' type='CompilerContext' />

        // Reserve space for variables
        if (block.atomic) {
            // Atomic blocks can have variables stored in temporary space
            block.variables.forEach(function each(variable) {
                variable.location = context.reserveTemporary(variable.type);
                context.registerVariable(variable.location);
            }.bind(this));
        } else {
            // Non-atomic blocks must have variables stored in stack
            block.variables.forEach(function each(variable) {
                variable.location = context.reserveStack(variable.type);
                context.registerVariable(variable.location);
            }.bind(this));
        }

        // Now just compile all nodes
        block.nodes.forEach(function each(node) {
            switch (node.nodeType) {
                case 'Comment':
                    context.push('/*' + node.val + '*/')
                    break;
                case 'For':
                    this.compileFor(node, context);
                    break;
                case 'FunctionCall':
                    var ret = this.compileFunctionCall(node, context);
                    if (ret) {
                        ret.freeVal();
                        ret.freeRef();
                    }
                    break;
                case 'FunctionDefinition':
                    break;      // TODO Add warning to non-global context
                case 'If':
                    this.compileIf(node, context);
                    break;
                case 'DoLoop':
                    this.compileDoLoop(node, context);
                    break;
                case 'Return':
                    this.compileReturn(node, context);
                    break;
                case 'VariableAssignment':
                    this.compileVariableAssignment(node, context);
                    break;
                case 'VariableDefinition':
                    this.compileVariableDefinition(node, context);
                    break;
                default:
                    throw new Error('Unsupported node type "' + node.nodeType + '"');
            }
        }.bind(this));


        // And finally free the reserved variables in reverse order
        block.variables.reverse().forEach(function each(variable) {
            context.freeVariable(variable.location);
        }.bind(this));
    },

    compileIf: function compileIf(statement, context) {
        /// <param name='statement' type='Nodes.If' />
        /// <param name='context' type='CompilerContext' />
        if (statement.trueStatement.atomic && (!statement.falseStatement || statement.falseStatement.atomic)) {
            var testValue = this.compileExpr(statement.expr, context);

            context.push('if(' + testValue.getValue() + '){');

            this.compileBlock(statement.trueStatement, context);

            if (statement.falseStatement) {
                context.push('}else{');
                if (statement.falseStatement.nodeType === 'If')
                    this.compileIf(statement.falseStatement, context);
                else
                    this.compileBlock(statement.falseStatement, context);
            }

            context.push('}');

            testValue.freeVal();
            testValue.freeRef();
        } else {
            // First compute the test value
            var testValue = this.compileExpr(statement.expr, context);
            if (testValue.refType === 'temp') {
                var tmp = context.reserveStack(testValue.type);
                tmp.setValue(testValue);

                tmp.freeVal = testValue.freeVal;
                testValue.freeRef();
                testValue = tmp;
            }

            // Then create functions
            var endFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            var trueFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            var falseFunc = endFunc;
            if (statement.falseStatement)
                var falseFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);

            // Do testing
            context.push('if(' + testValue.getValue() + '){');
            // Go to the true branch if needed
            context.setCallStack(trueFunc);
            context.push('return 1;');
            context.push('}');

            // Otherwice go to the false statement (or end if false doesn't exist)
            context.setCallStack(falseFunc);
            context.push('return 1;');

            // Compile true and false blocks
            context.setCurrentFunction(trueFunc);
            this.compileBlock(statement.trueStatement, context);
            context.setCallStack(endFunc);
            context.push('return 1;');

            if (statement.falseStatement) {
                context.setCurrentFunction(falseFunc);
                if (statement.falseStatement.nodeType === 'If')
                    this.compileIf(statement.falseStatement, context);
                else
                    this.compileBlock(statement.falseStatement, context);
                context.setCallStack(endFunc);
                context.push('return 1;');
            }

            // Continue compiling to the end of if statement
            context.setCurrentFunction(endFunc);

            testValue.freeVal();
            testValue.freeRef();
            //throw new Error('Non-atomic if statements not supported yet');
        }
    },
    compileFor: function compileFor(loop, context) {
        /// <param name='loop' type='Nodes.For' />
        /// <param name='context' type='CompilerContext' />
        if (loop.atomic) {
            // Reserve a variable for the loop
            loop.variable.location = context.reserveTemporary(loop.variable.type);
            var start = this.compileExpr(loop.start, context);
            loop.variable.location.setValue(start);
            loop.variable.location.freeVal = start.freeVal;
            start.freeRef();
            var stop = this.compileExpr(loop.stop, context);
            var step = this.compileExpr(loop.step, context);

            '(((' + step.getValue() + '>0)|0)&((' + loop.variable.location.getValue() + '<=' + stop.getValue() + ')|0))';
            '(((' + step.getValue() + '<0)|0)&((' + loop.variable.location.getValue() + '<=' + stop.getValue() + ')|0))';
            context.push('while('
                + '(((' + step.getValue() + '>0)|0)&((' + loop.variable.location.getValue() + '<=' + stop.getValue() + ')|0))'
                + '|(((' + step.getValue() + '<0)|0)&((' + loop.variable.location.getValue() + '>=' + stop.getValue() + ')|0))'
                + '){');
            this.compileBlock(loop.block, context);
            // Increase the index
            var newIndex = context.reserveConstant(loop.variable.type);
            newIndex.setValue(loop.variable.location.getValue() + '+' + step.getValue());
            loop.variable.location.setValue(newIndex);
            newIndex.freeRef();
            context.push('}');

            step.freeVal();
            step.freeRef();
            stop.freeVal();
            stop.freeRef();
            loop.variable.location.freeVal();
            loop.variable.location.freeRef();
        } else {
            // Reserve a variable for the loop
            loop.variable.location = context.reserveStack(loop.variable.type);
            var start = this.compileExpr(loop.start, context);
            loop.variable.location.setValue(start);
            loop.variable.location.freeVal = start.freeVal;
            start.freeRef();
            var stop = this.compileExpr(loop.stop, context);
            var tmp = context.reserveStack(stop.type);
            tmp.setValue(stop);
            tmp.freeVal = stop.freeVal;
            stop.freeRef();
            stop = tmp;
            var step = this.compileExpr(loop.step, context);
            tmp = context.reserveStack(step.type);
            tmp.setValue(step);
            tmp.freeVal = step.freeVal;
            step.freeRef();
            step = tmp;

            // Go to loop function
            var endFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            var loopFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            context.setCallStack(loopFunc);
            context.push('return 1;');
            // ...Begin loop function with checks
            context.setCurrentFunction(loopFunc);
            // Do break checking
            context.push('if('
                + '(((' + step.getValue() + '>0)|0)&((' + loop.variable.location.getValue() + '>' + stop.getValue() + ')|0))'
                + '|(((' + step.getValue() + '<0)|0)&((' + loop.variable.location.getValue() + '<' + stop.getValue() + ')|0))'
                + '){');
            // Break out
            context.setCallStack(endFunc);
            context.push('return 1;');
            context.push('}');

            // Compile block
            this.compileBlock(loop.block, context);
            // Increase the index
            var newIndex = context.reserveConstant(loop.variable.type);
            newIndex.setValue(loop.variable.location.getValue() + '+' + step.getValue());
            loop.variable.location.setValue(newIndex);
            newIndex.freeRef();
            // Jump to the begining
            context.setCallStack(loopFunc);
            context.push('return 1;');

            // Set context to the return func
            context.setCurrentFunction(endFunc);

            // Free memory
            step.freeVal();
            step.freeRef();
            stop.freeVal();
            stop.freeRef();
            loop.variable.location.freeVal();
            loop.variable.location.freeRef();
        }
    },
    compileFunctionCall: function compileFunctionCall(call, context) {
        /// <param name='call' type='Nodes.FunctionCall' />
        /// <param name='context' type='CompilerContext' />

        // Compile parameters
        var params = this.compileExprList(call.params, context);


        context.push('/* Calling function ' + call.name + '*/');
        // Align the stack
        var align = context.alignStack();

        // Create parameter string
        var paramStr = [];
        params.forEach(function each(param, i) {
            var type = call.handle.entry.paramTypes[i];
            // Cast parameter to right type
            paramStr.push(type.cast(param.type.castTo(param.getValue(), type)));
        }.bind(this));
        var buf = [];
        buf.push(call.handle.entry.name);
        buf.push('(');
        buf.push(paramStr.join(','));
        buf.push(')');

        var retType = call.handle.returnType;
        var retVal;
        if (retType) {

            if (call.handle.atomic) {
                if (call.handle.returnType === this.types.Double)
                    buf.unshift('+');
                else
                    buf.push('|0');
                var cnt = context.reserveConstant(retType);
                cnt.setValue(buf.join(''));
                retVal = context.reserveTemporary(retType);
                retVal.setValue(cnt);
            } else {
                // For non-atomic functions, first set the return function
                var retFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
                context.setCallStack(retFunc);
                // ...Then call the function...
                context.push(buf.join('') + '|0;');
                // ...Change the context to use the return function...
                context.push('return 1;');
                context.setCurrentFunction(retFunc);
                // ...And finally the returned value is found from the top of the stack
                var stackTop = context.reserveStack(retType);
                retVal = context.reserveTemporary(retType);
                retVal.setValue(stackTop);
                retVal.freeVal = stackTop.freeVal;
                stackTop.freeRef();
            }
        } else {
            if (call.handle.atomic) {
                context.push(buf.join('') + ';');
            } else {
                // For non-atomic functions, first set the return function
                var retFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
                context.setCallStack(retFunc);
                // ...Then call the function...
                context.push(buf.join('') + '|0;');
                context.push('return 1;');
                // ...And change the context to use the return function
                context.setCurrentFunction(retFunc);
            }
        }



        //context.push(buf.join(''));

        // Revert the stack alignment
        context.revertAlign(align);
        // And free parameters
        params.reverse().forEach(function each(param) {
            param.freeVal();
            param.freeRef();
        }.bind(this));

        return retVal;
    },
    compileDoLoop: function compileDoLoop(loop, context) {
        /// <param name='loop' type='Nodes.DoLoop' />
        /// <param name='context' type='CompilerContext' />
        if (loop.atomic) {
            context.push('while(1){');
            if (loop.beginCondition) {
                var testValue = this.compileExpr(loop.beginCondition, context);
                context.push('if((!(' + testValue.getValue() + '))|0){');
                testValue.freeVal();
                testValue.freeRef(false);
                context.push('break;');
                context.push('}');
                testValue.freeVal();
                testValue.freeRef();
            }
            this.compileBlock(loop.block, context);
            if (loop.endCondition) {
                var testValue = this.compileExpr(loop.endCondition, context);
                context.push('if((!(' + testValue.getValue() + '))|0){');
                testValue.freeVal();
                testValue.freeRef(false);
                context.push('break;');
                context.push('}');
                testValue.freeVal();
                testValue.freeRef();
            }
            context.push('}');
        } else {
            // Go to loop function
            var endFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            var loopFunc = this.createEntry(this.generateFunctionName(), true, undefined, this.types.Integer);
            context.setCallStack(loopFunc);
            context.push('return 1;');

            // Compile block
            context.setCurrentFunction(loopFunc);
            if (loop.beginCondition) {
                var testValue = this.compileExpr(loop.beginCondition, context);
                context.push('if((!(' + testValue.getValue() + '))|0){');
                testValue.freeVal();
                testValue.freeRef(false);
                context.setCallStack(endFunc);
                context.push('return 1;');
                context.push('}');
                testValue.freeVal();
                testValue.freeRef();
            }
            this.compileBlock(loop.block, context);
            if (loop.endCondition) {
                var testValue = this.compileExpr(loop.endCondition, context);
                context.push('if((!(' + testValue.getValue() + '))|0){');
                testValue.freeVal();
                testValue.freeRef(false);
                context.setCallStack(endFunc);
                context.push('return 1;');
                context.push('}');
                testValue.freeVal();
                testValue.freeRef();
            }
            // Jump to the begining
            context.setCallStack(loopFunc);
            context.push('return 1;');

            // Set context to the return func
            context.setCurrentFunction(endFunc);
        }
    },
    compileReturn: function compileReturn(statement, context) {
        /// <param name='statement' type='Nodes.Return' />
        /// <param name='context' type='CompilerContext' />

        // First compute the value to be returned
        var val = this.compileExpr(statement.expr, context);
        // Then free all reserved values
        context.freeAll(false);
        // TODO Free parameters

        if (context.atomic) {
            context.push('return ' + val.getValue() + ';');
        } else {
            context.push('SP=(SP-' + context.stackOffset + ')|0;');
            var topref = new CompilerStackReference(statement.type, context.stackOffset, 0, context);
            topref.setValue(val);
            context.push('CP=(CP-4)|0;');
            context.push('return 1;');
            //throw new Error('Non-atomic returning functions not supported yet');
        }

        // After everything free the returned value (though this code will never be executed)
        val.freeVal();
        val.freeRef();
    },
    compileVariableAssignment: function compileVariableAssignment(variable, context) {
        /// <param name='variable' type='Nodes.VariableAssignment' />
        /// <param name='context' type='CompilerContext' />
        var type = variable.ref.type;
        if (type.isArray()) {
            // Compute the index
            var dimensions = this.compileExprList(variable.index, context, variable.expr.atomic);

            if (dimensions.length !== type.dimensionCount)
                throw new Error('Trying to access ' + type.dimensionCount + '-dimensional array with ' + dimensions.length + ' dimensions');

            // Then compute the location of the variable
            var indexStr = dimensions[0].type.castTo(dimensions[0].getValue(), this.types.Integer);
            for (var i = 1; i < dimensions.length; i++) {
                // A reference to the size of the current dimension
                var offset = context.reserveConstant(this.types.Integer);
                offset.setValue(variable.ref.location.getValue() + '+' + (4 * i));
                var ref = new CompilerAbsoluteReference(this.types.Integer, offset, context);

                indexStr = '(((imul(' + indexStr + ',' + ref.getValue() + ')|0)+' + dimensions[i].type.castTo(dimensions[i].getValue(), this.types.Integer) + ')|0)';
            }

            // The offset of the referenced index
            var offset = context.reserveConstant(this.types.Integer);
            offset.setValue(variable.ref.location.getValue() + '+' + type.dataOffset + '+((' + indexStr + ')<<' + type.elementShift + ')');
            // And the reference
            var ref = new CompilerAbsoluteReference(variable.ref.type.itemType, offset, context);

            // Finally compute the value and push it to the array
            var val = this.compileExpr(variable.expr, context);
            ref.setValue(val);
            val.freeRef();

            var i = dimensions.length;
            while (i--) {
                dimensions[i].freeVal();
                dimensions[i].freeRef();
            }

            //throw new Error('Arrays not supported, yet');
            return;
        }

        var ref = this.compileExpr(variable.expr, context);
        variable.ref.location.setValue(ref);
        ref.freeRef();
    },
    compileVariableDefinition: function compileVariableDefinition(variable, context) {
        /// <param name='variable' type='Nodes.VariableDefinition' />
        /// <param name='context' type='CompilerContext' />
        var type = variable.type;
        if (type.isArray()) {
            if (variable.initial)
                throw new Error('Variables with initial values not supported');
            //if (type.itemType === this.types.Double)
            //    throw new Error('Double typed arrays not supported. Yet');

            // Compile the expressions for size
            var dimensions = this.compileExprList(variable.dimensions, context);

            // Compute the actual size of the string
            var sizeStr = dimensions[0].type.castTo(dimensions[0].getValue(), this.types.Integer);
            for (var i = 1; i < dimensions.length; i++) {
                sizeStr = 'imul(' + sizeStr + ',' + dimensions[i].type.castTo(dimensions[i].getValue(), this.types.Integer) + ')|0';
            }
            /*var sizeStr = [];
            dimensions.forEach(function each(dim) {
                sizeStr.push(dim.getValue());
            }.bind(this));
            sizeStr = sizeStr.join('*');*/

            // Reserve memory
            var cnt = context.reserveConstant(type);
            cnt.setValue('__memreserve(((((' + sizeStr + ')<<' + type.elementShift + ')|0)+' + type.dataOffset + ')|0)|0');

            // Save value to variable
            variable.location.setValue(cnt);
            cnt.freeRef();

            // Finally fill in array dimensions to the begining of the reserved area
            for (var i = 0; i < dimensions.length; i++) {
                var offset = context.reserveConstant(this.types.Integer);
                offset.setValue(variable.location.getValue() + '+' + (4 * i));

                var value = context.reserveConstant(this.types.Integer);
                value.setValue(dimensions[i]);

                var ref = new CompilerAbsoluteReference(this.types.Integer, offset, context);
                ref.setValue(value);
            }

            // Free the dimensions
            var i = dimensions.length;
            while (i--) {
                dimensions[i].freeVal();
                dimensions[i].freeRef();
            }

            //throw new Error('Arrays not supported, yet');
            return;
        }

        if (variable.initial) {
            var ref = this.compileExpr(variable.initial, context);
            variable.location.setValue(ref);
            ref.freeRef();
        }
    },

    compileExprList: function compileExprList(list, context, atomic) {
        if (atomic !== false)
            atomic = true;
        var res = [];
        list.forEach(function each(expr) {
            if (!expr.atomic || !atomic) {
                // This expr is not atomic so push every earlier expression to the stack if it is not there already
                res = res.map(function each(ref) {
                    if (ref.refType !== 'stack' && ref.refType !== 'const') {           // TODO Check that works with no-free
                        // Push this to the top of the stack
                        var stackRef = context.reserveStack(ref.type);
                        stackRef.setValue(ref);
                        stackRef.freeVal = ref.freeVal;
                        ref.freeRef();
                        ref = stackRef;
                    }
                    return expr;
                }.bind(this));
            }
            // Don't forget to push this to the stack
            res.push(this.compileExpr(expr, context));
        }.bind(this));
        return res;
    },

    compileExpr: function compileExpr(expr, context) {
        /// <param name='context' type='CompilerContext' />
        switch (expr.nodeType) {
            case 'Number':
                return this.compileNumberExpr(expr, context);
            case 'String':
                return this.compileStringExpr(expr, context);
            case 'Variable':
                return this.compileVariableExpr(expr, context);
            case 'BinaryOp':
                return this.compileBinaryExpr(expr, context);
            case 'UnaryOp':
                return this.compileUnaryExpr(expr, context);
            case 'FunctionCall':
                return this.compileFunctionCall(expr, context);
            case 'IndexOp':
                return this.compileIndexExpr(expr, context);
            default:
                throw new Error('Unsupported node type "' + expr.nodeType + '"');
        }
    },
    compileNumberExpr: function compileNumberExpr(num, context) {
        /// <param name='num' type='Nodes.Number' />
        /// <param name='context' type='CompilerContext' />
        var ref = context.reserveConstant(num.type);
        ref.setValue(num.val);
        return ref;
    },
    compileStringExpr: function compileStringExpr(str, context) {
        /// <param name='str' type='Nodes.String' />
        /// <param name='context' type='CompilerContext' />
        var ref = context.reserveTemporary(str.type);
        // Convert string to utf8
        var utf8 = toUTF8Array(str.val);
        // Reserve space for the string
        var cnt = context.reserveConstant(str.type);
        cnt.setValue('__memreserve(' + (utf8.length + 4) + ')|0');
        ref.setValue(cnt);
        cnt.freeRef();
        // Save the length of the payload
        var sizeRef = new CompilerAbsoluteReference(this.types.Integer, ref, context);
        cnt = context.reserveConstant(this.types.Integer);
        cnt.setValue('' + utf8.length);
        sizeRef.setValue(cnt);
        // And then finally save the payload
        for (var i = 0; i < utf8.length; i++) {
            context.push('MEMU8[(' + ref.getValue() + '+' + (4 + i) + ')>>0]=' + utf8[i] + ';');
        }

        return ref;
    },
    compileVariableExpr: function compileVariableExpr(variable, context) {
        /// <param name='num' type='Nodes.Variable' />
        /// <param name='context' type='CompilerContext' />
        // Return the value as a constant expression so that the original
        // value won't be freed by accident
        var ref = new CompilerNoFreeReference(variable.definition.location);
        //ref.setValue(variable.definition.location);
        return ref;
    },
    compileBinaryExpr: function compileBinaryExpr(expr, context) {
        /// <param name='expr' type='Nodes.BinaryOp' />
        /// <param name='context' type='CompilerContext' />

        // Get the operator compilation object
        var comp = expr.operator.compiler;
        // Reserve result here first so that if it goes to the stack,
        // operands can still be popped from above
        if (expr.atomic)
            var res = context.reserveTemporary(comp.returnType);
        else
            var res = context.reserveStack(comp.returnType);
        // Compile left and right operands
        var leftRef = this.compileExpr(expr.left, context);
        var rightRef = this.compileExpr(expr.right, context);
        // Get values as string with the right kind of casting for the operator
        var left = leftRef.type.castTo(leftRef.getValue(), comp.leftType);
        var right = rightRef.type.castTo(rightRef.getValue(), comp.rightType);

        var src;
        // Compile operator depending on if it is infix or not
        if (comp.infix) {
            src = left + comp.func + right;
        } else {
            src = comp.func + '(' + left + ',' + right + ')';
        }
        // Save the expression as constant so that it can then be set to the return object
        var cnt = context.reserveConstant(comp.returnType);
        cnt.setValue(src);

        res.setValue(cnt);

        // And last but not least, return all the memory we have reserved
        rightRef.freeVal();
        rightRef.freeRef();
        leftRef.freeVal();
        leftRef.freeRef();
        return res;
    },
    compileUnaryExpr: function compileUnaryExpr(expr, context) {
        /// <param name='expr' type='Nodes.UnaryOp' />
        /// <param name='context' type='CompilerContext' />

        // Get the operator compilation object
        var comp = expr.operator.compiler;
        // Reserve result here first so that if it goes to the stack,
        // operands can still be popped from above
        if (expr.atomic)
            var res = context.reserveTemporary(comp.returnType);
        else
            var res = context.reserveStack(comp.returnType);
        // Compile the operamd
        var inputRef = this.compileExpr(expr.expr, context);
        // Get value as string with the right kind of casting for the operator
        var inpt = inputRef.type.castTo(inputRef.getValue(), comp.inputType);

        var src;
        // Compile operator depending on if it is call or not
        if (comp.call) {
            src = comp.func + '(' + input + ')';
        } else {
            src = comp.func + inpt;
        }
        // Save the expression as constant so that it can then be set to the return object
        var cnt = context.reserveConstant(comp.returnType);
        cnt.setValue(src);

        res.setValue(cnt);

        // And last but not least, return all the memory we have reserved
        inputRef.freeVal();
        inputRef.freeRef();
        return res;
    },
    compileIndexExpr: function compileIndexExpr(variable, context) {
        /// <param name='variable' type='Nodes.IndexOp' />
        /// <param name='context' type='CompilerContext' />

        // First find out the index
        var dimensions = this.compileExprList(variable.index, context, variable.expr.atomic);

        if (dimensions.length !== variable.expr.type.dimensionCount)
            throw new Error('Trying to access ' + variable.expr.type.dimensionCount + '-dimensional array with ' + dimensions.length + ' dimensions');

        // Get the array location
        var base = this.compileExpr(variable.expr, context);

        // Then compute the location of the variable
        var indexStr = dimensions[0].type.castTo(dimensions[0].getValue(), this.types.Integer);
        for (var i = 1; i < dimensions.length; i++) {
            // A reference to the size of the current dimension
            var offset = context.reserveConstant(this.types.Integer);
            offset.setValue(base.getValue() + '+' + (4 * i));
            var ref = new CompilerAbsoluteReference(this.types.Integer, offset, context);

            indexStr = '(((imul(' + indexStr + ',' + ref.getValue() + ')|0)+' + dimensions[i].type.castTo(dimensions[i].getValue(), this.types.Integer) + ')|0)';
        }

        // Then get offset to the item
        var offset = context.reserveConstant(this.types.Integer);
        offset.setValue(base.getValue() + '+' + variable.expr.type.dataOffset + '+((' + indexStr + ')<<' + variable.expr.type.elementShift + ')');
        // And a reference to it
        var ref = new CompilerAbsoluteReference(variable.expr.type.itemType, offset, context);

        // Get rid of the trash
        var i = dimensions.length;
        while (i--) {
            dimensions[i].freeVal();
            dimensions[i].freeRef();
        }

        var tmpref = context.reserveTemporary(variable.expr.type.itemType);
        tmpref.setValue(ref);

        return tmpref;
        //throw new Error('Arrays not supported, yet');
    },
};



function CreateIthName(i) {
    buf = [];
    do {
        buf.push(String.fromCharCode(97 + i % 26));
        i = Math.floor(i / 26);
    } while (i > 0);
    return buf.join('');
}
function nextPowerOfTwo(x) {
    if (x <= 0)
        return 0;
    x--;
    x |= x >> 1;
    x |= x >> 2;
    x |= x >> 4;
    x |= x >> 8;
    x |= x >> 16;
    x++;
    return x;
}


// From StackOverflow: http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
            // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >> 18),
                      0x80 | ((charcode >> 12) & 0x3f),
                      0x80 | ((charcode >> 6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
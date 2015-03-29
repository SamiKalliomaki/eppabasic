import AsmjsTargetProgram = require('../compiler/AsmjsTargetProgram');

/**
 * This interface is implemented by compiler compiled asm.js code.
 */
interface Program {
    /**
     * Pops one function from the program's call stack.
     */
    popCallstack(): void;
    /**
     * Sets an integer value to the value at the top of the program stack.
     * @param value Integer to set to the top of the stack.
     */
    setStackInt(value: number): void;
    /**
     * Sets a double value to the value at the top of the program stack.
     * @param value Double to set to the top of the stack.
     */
    setStackDbl(value: number): void;
    /**
     * Initializes the program.
     */
    init(): void;
    /**
     * Executes the next step of the program.
     * @return 1 if the program stil continues, 0 if the program has ended.
     */
    next(): number;
    /**
     * Breaks execution of the program at next possible point.
     */
    breakExec(): void;
    /**
     * Gets position of the stack poiner.
     * @returns Position of the stack pointer.
     */
    sp(): number;
    /**
     * Gets position of the call stack poiner.
     * @returns Position of the call stack pointer.
     */
    cp(): number;
    /**
     * Reserves memory from the program.
     * @param size Size of the memory being reserved.
     * @returns Pointer to reserved block.
     */
    memreserve(size: number): number;
    /**
     * Gets the last executed line of the code.
     * @returns Last executed line of the code.
     */
    getLine(): number;

    // Memory views

    /**
     * A view to heap using signed 8 bit integers.
     */
    MEMS8: Int8Array;
    /**
     * A view to heap using signed 16 bit integers.
     */
    MEMS16: Int16Array;
    /**
     * A view to heap using signed 32 bit integers.
     */
    MEMS32: Int32Array;
    /**
     * A view to heap using unsigned 8 bit integers.
     */
    MEMU8: Uint8Array;
    /**
     * A view to heap using unsigned 16 bit integers.
     */
    MEMU16: Uint16Array;
    /**
     * A view to heap using unsigned 32 bit integers.
     */
    MEMU32: Uint32Array;
}

module Program {
    export function fromAsmjsTargetProgram(targetProgram: AsmjsTargetProgram, stdlib: any, env: any, heap: ArrayBuffer): Program {
        var programFactory =  <(stdlib: any, env: any, heap: ArrayBuffer) => Program> new Function('stdlib', 'env', 'heap', targetProgram.code);
        var program = programFactory(stdlib, env, heap);
        program.MEMS8 = new Int8Array(heap);
        program.MEMS16 = new Int16Array(heap);
        program.MEMS32 = new Int32Array(heap);
        program.MEMU8 = new Uint8Array(heap);
        program.MEMU16 = new Uint16Array(heap);
        program.MEMU32 = new Uint32Array(heap);
        return program;
    }
}

export = Program;

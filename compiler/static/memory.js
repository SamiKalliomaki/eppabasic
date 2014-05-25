function compilerMemory() {
    var memnextFree = 0;
    var HEAP_SIZE = env.heapSize|0;

    function meminit() {
        memnextFree = 0;
    }

    function memreserve4(size) {
        size = size | 0;
        while (memnextFree & 3)
            memnextFree = (memnextFree + 1) | 0;
        memnextFree = (memnextFree + size) | 0;
        return (memnextFree - size) | 0;
    }

    function memreserve8(size) {
        size = size | 0;
        while (memnextFree & 7)
            memnextFree = (memnextFree + 1) | 0;
        memnextFree = (memnextFree + size) | 0;
        return (memnextFree - size) | 0;
    }

    function memfree(ptr) {
        ptr = ptr | 0;
        // TODO Free memory
    }
}
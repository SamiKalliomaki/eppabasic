function heapinit(size) {
    size = size | 0;
    // Make size multiple of 8
    while ((size & 7) | 0) size = (size - 1) | 0;
    /// Create the first block
    // Header
    HEAP32U[0 >> 2] = 0;
    HEAP32U[4 >> 2] = (size - 8) | 0;
    // Footer
    HEAP32U[((size - 8) | 0) >> 2] = 0;
    NEXT_BLOCK = 0;
    HEAP_END = size;
}
function alloc(size) {
    size = size | 0;
    var header = 0;
    var footer = 0;
    var i = 0;
    // Make size multiple of 8
    size = (size + 7) & 0xfffffff8;
    // And add the size of the header
    size = (size + 8) | 0;
    // Find header of the right size
    header = heapfind(size | 0) | 0;
    footer = (header + (HEAP32U[(header + 4) >> 2] | 0)) | 0;
    // Split block if possible
    if ((size | 0) < (HEAP32U[((header | 0) + 4) >> 2] | 0)) {
        // Reserved part of the block
        HEAP32U[((header | 0) + 4) >> 2] = size;
        HEAP32U[((header | 0) + size) >> 2] = header;
        // Left over
        HEAP32U[((header | 0) + size + 4) >> 2] = (footer - header - size) | 0;
        HEAP32U[footer >> 2] = (header + size) | 0;
    }
    // Reserve this block
    HEAP32U[(header + 4) >> 2] = HEAP32U[(header + 4) >> 2] | 1;
    // And finally zero it out
    header = (header + 8) | 0;
    size = (size - 8) | 0;
    for (i = 0; (i | 0) < (size | 0) ; i = (i + 1) | 0) {
        HEAP32U[(header + i) >> 2] = 0;
    }
    return header | 0;
}
function heapfind(size) {
    size = size | 0;
    var around = 0;
    var start = 0;
    start = NEXT_BLOCK;
    while (1) {
        if ((HEAP32U[((NEXT_BLOCK + 4) | 0) >> 2] & 1) == 0) {
            // A free block
            if ((HEAP32U[((NEXT_BLOCK + 4) | 0) >> 2] | 0) >= (size | 0)) {
                // And of appropriate size!
                // Let's take it!
                return NEXT_BLOCK | 0;
            }
        }
        // Reserved or too small -> move to the next one
        NEXT_BLOCK = (NEXT_BLOCK + (HEAP32U[((NEXT_BLOCK + 4) | 0) >> 2] | 0)) & 0xfffffff8;
        // Test if we get out so return to the start
        if (((NEXT_BLOCK + 8) | 0) >= (HEAP_END | 0)) {
            NEXT_BLOCK = 0;
            around = 1;
        }
        if ((around | 0) & ((NEXT_BLOCK | 0) >= (start | 0))) {
            __panic();
            return 0;
        }
    }
    return 0;
}
function free(ptr) {
    ptr = ptr | 0;
    // Move to point to the header
    ptr = (ptr - 8) | 0;
    // Mark as free
    HEAP32U[(ptr + 4) >> 2] = HEAP32U[(ptr + 4) >> 2] & 0xfffffffe;
    // And try to coalese
    heapcoalesce(ptr);
}
function heapcoalesce(header) {
    header = header | 0;
    var header2 = 0;
    var footer = 0;
    var tmp = 0;
    // First try to coalesce with the next one
    header2 = (header + (HEAP32U[(header + 4) >> 2] | 0)) | 0;
    if ((HEAP32U[((header2 + 4) | 0) >> 2] & 1) == 0) {
        // Combine header
        HEAP32U[((header + 4) | 0) >> 2] = ((HEAP32U[((header + 4) | 0) >> 2] | 0) + (HEAP32U[((header2 + 4) | 0) >> 2] | 0));
        // And then footer
        footer = (header + (HEAP32U[(header + 4) >> 2] | 0)) | 0;
        HEAP32U[footer >> 2] = header;
    }
    // And then with the previous one
    header2 = HEAP32U[header >> 2] | 0;
    if ((HEAP32U[((header2 + 4) | 0) >> 2] & 1) == 0) {
        // Swap header locations
        tmp = header;
        header = header2;
        header2 = tmp;
        // And then just use the same coalesce as above
        // Combine header
        HEAP32U[((header + 4) | 0) >> 2] = ((HEAP32U[((header + 4) | 0) >> 2] | 0) + (HEAP32U[((header2 + 4) | 0) >> 2] | 0));
        // And then footer
        footer = (header + (HEAP32U[(header + 4) >> 2] | 0)) | 0;
        HEAP32U[footer >> 2] = header;
    }
    // And finally put search pointer to this position to avoid confusion
    NEXT_BLOCK = header;
}
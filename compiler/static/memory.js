function __meminit(size) {
    size = size | 0;
    // Make size multiple of 8
    while ((size & 7) | 0) size = (size - 1) | 0;

    /// Create the first block
    // Header
    MEMS32[0 >> 2] = 0;
    MEMS32[4 >> 2] = (size - 8) | 0;
    // Footer
    MEMS32[((size - 8) | 0) >> 2] = 0;

    NEXT_BLOCK = 0;
    HEAP_END = size;
}
function __memreserve(size) {
    size = size | 0;

    var header = 0;
    var footer = 0;
    var i = 0;

    // Make size multiple of 8
    size = (size + 7) & 0xfffffff8;
    // And add the size of the header
    size = (size + 8) | 0;

    // Find header of the right size
    header = __memfind(size | 0) | 0;
    footer = (header + (MEMS32[(header + 4) >> 2] | 0)) | 0;

    // Split block if possible
    if ((size | 0) < (MEMS32[((header | 0) + 4) >> 2] | 0)) {
        // Reserved part of the block
        MEMS32[((header | 0) + 4) >> 2] = size;
        MEMS32[((header | 0) + size) >> 2] = header;

        // Left over
        MEMS32[((header | 0) + size + 4) >> 2] = (footer - header - size) | 0;
        MEMS32[footer >> 2] = (header + size) | 0;
    }

    // Reserve this block
    MEMS32[(header + 4) >> 2] = MEMS32[(header + 4) >> 2] | 1;

    // And finally zero it out
    header = (header + 8) | 0;
    size = (size - 8) | 0;
    for (i = 0; (i | 0) < (size | 0) ; i = (i + 1) | 0) {
        MEMS32[(header + i) >> 2] = 0;
    }

    return header | 0;
}

function __memfind(size) {
    size = size | 0;
    var around = 0;
    var start = 0;

    start = NEXT_BLOCK;

    while (1) {
        if ((MEMS32[((NEXT_BLOCK + 4) | 0) >> 2] & 1) == 0) {
            // A free block
            if ((MEMS32[((NEXT_BLOCK + 4) | 0) >> 2] | 0) >= (size | 0)) {
                // And of appropriate size!
                // Let's take it!
                return NEXT_BLOCK | 0;
            }
        }

        // Reserved or too small -> move to the next one
        NEXT_BLOCK = (NEXT_BLOCK + (MEMS32[((NEXT_BLOCK + 4) | 0) >> 2] | 0)) & 0xfffffff8;
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

function __memfree(ptr) {
    ptr = ptr | 0;

    // Move to point to the header
    ptr = (ptr - 8) | 0;

    // Mark as free
    MEMS32[(ptr + 4) >> 2] = MEMS32[(ptr + 4) >> 2] & 0xfffffffe;

    // And try to coalese
    __memcoalesce(ptr);
}

function __memcoalesce(header) {
    header = header | 0;

    var header2 = 0;
    var footer = 0;
    var tmp = 0;

    // First try to coalesce with the next one
    header2 = (header + (MEMS32[(header + 4) >> 2] | 0)) | 0;
    if ((MEMS32[((header2 + 4) | 0) >> 2] & 1) == 0) {
        // Combine header
        MEMS32[((header + 4) | 0) >> 2] = ((MEMS32[((header + 4) | 0) >> 2] | 0) + (MEMS32[((header2 + 4) | 0) >> 2] | 0));
        // And then footer
        footer = (header + (MEMS32[(header + 4) >> 2] | 0)) | 0;
        MEMS32[footer >> 2] = header;
    }

    // And then with the previous one
    header2 = MEMS32[header >> 2] | 0;
    if ((MEMS32[((header2 + 4) | 0) >> 2] & 1) == 0) {
        // Swap header locations
        tmp = header;
        header = header2;
        header2 = tmp;
        // And then just use the same coalesce as above

        // Combine header
        MEMS32[((header + 4) | 0) >> 2] = ((MEMS32[((header + 4) | 0) >> 2] | 0) + (MEMS32[((header2 + 4) | 0) >> 2] | 0));
        // And then footer
        footer = (header + (MEMS32[(header + 4) >> 2] | 0)) | 0;
        MEMS32[footer >> 2] = header;
    }

    // And finally put search pointer to this position to avoid confusion
    NEXT_BLOCK = header;
}
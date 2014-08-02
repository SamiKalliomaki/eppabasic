function __concat(stra, strb) {
    stra = stra | 0;
    strb = strb | 0;
    var alen = 0;
    var blen = 0;
    var clen = 0;
    var strc = 0;
    var ptr = 0;
    var ptrc = 0;
    alen = MEMS32[(stra | 0) >> 2] | 0;
    blen = MEMS32[(strb | 0) >> 2] | 0;
    clen = (alen + blen) | 0;
    strc = __memreserve((clen + (STRING_HEADER_LENGTH | 0)) | 0) | 0;
    ptrc = (strc + (STRING_HEADER_LENGTH | 0)) | 0;
    ptr = (stra + (STRING_HEADER_LENGTH | 0)) | 0;
    MEMS32[(strc | 0) >> 2] = clen | 0;
    while (alen | 0) {
        MEMU8[(ptrc | 0) >> 0] = MEMU8[(ptr | 0) >> 0];
        ptrc = (ptrc + 1) | 0;
        ptr = (ptr + 1) | 0;
        alen = (alen - 1) | 0;
    }
    ptr = (strb + (STRING_HEADER_LENGTH | 0)) | 0;
    while (blen | 0) {
        MEMU8[(ptrc | 0) >> 0] = MEMU8[(ptr | 0) >> 0];
        ptrc = (ptrc + 1) | 0;
        ptr = (ptr + 1) | 0;
        blen = (blen - 1) | 0;
    }
    return strc | 0;
}

function __streq(a, b) {
    a = a | 0;
    b = b | 0;
    var c = 0;      // Iterator end

    // Test that the lengths are the same
    if (((MEMS32[a >> 2] | 0) != (MEMS32[a >> 2] | 0)) | 0)
        return 0;
    c = ((MEMS32[a >> 2] | 0) + a + STRING_HEADER_LENGTH) | 0;

    for (; ((a | 0) < (c | 0)) | 0; a = (a + 1) | 0, b = (b + 1) | 0)
        if (((MEMU8[a >> 0] | 0) != (MEMU8[b >> 0] | 0)) | 0)
            return 0;

    return 1;
}
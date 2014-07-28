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
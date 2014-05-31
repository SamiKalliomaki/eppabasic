function compilerString() {
    function strconcat(a, b) {
        a = a | 0;
        b = b | 0;

        var al = 0;
        var bl = 0;
        var cl = 0;
        var c = 0;
        var cp = 0;
        var i = 0;

        al = MEMU32[a >> 2] | 0;
        bl = MEMU32[b >> 2] | 0;

        cl = (al + bl) | 0;
        c = memreserve4((cl + 8) | 0) | 0;
        MEMU32[c >> 2] = cl;
        cp = (c + 8) | 0;

        for (i = 0; ((i | 0) < (al | 0)) | 0 ; i = (i + 1) | 0) {
            MEMU8[cp] = MEMU8[((a + i + 8) | 0)] | 0;
            cp = (cp + 1) | 0;
        }
        for (i = 0; (i | 0) < (bl | 0) ; i = (i + 1) | 0) {
            MEMU8[cp] = MEMU8[((b + i + 8) | 0)] | 0;
            cp = (cp + 1) | 0;
        }

        return c | 0;
    }
}
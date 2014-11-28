
/**
 * Integers are saved in little endian array.
 * Each item in the array are saved as 32 bit unsigned integers.
 * Each 
 * 
 * Integers are saved in the following form:
 * +--------+------+----------+
 * | region | size | data ... |
 * +--------+------+----------+
 * | offset |    0 |        4 |
 * +--------+------+----------+
 * 
 * The size is a 32 bit unsigned integer
 */

/**
 * Performs an addition
 */
function intadd(A, B) {
    // Locations of numbers
    A = A | 0;
    B = B | 0;
    var R = 0;
    // Length of numbers
    var Al = 0;
    var Bl = 0;
    var Rl = 0;

    var t = 0;      // Temporary
    var i = 0;      // Index
    var c = 0;      // Carry
    var a = 0;      // A piece of A
    var b = 0;      // A piece of B
    var r = 0;      // A piece of R

    // Read the lenghts of the numbers
    Al = HEAP32U[A >> 2];
    Bl = HEAP32U[B >> 2];

    // Make sure A is longer
    if ((Al | 0) < (Bl | 0)) {
        t = A, A = B, B = t;
        t = Al, Al = Bl, Bl = t;
    }

    // Reserve memory for R
    Rl = Al + 4 | 0;
    R = alloc(Rl + 4 | 0) | 0;

    // Move pointers to point to the start of the data
    A = A + 4 | 0;
    B = B + 4 | 0;
    R = R + 4 | 0;

    // Perform the addition
    for (; (i | 0) < (Bl | 0) ; i = i + 4 | 0) {
        // Load
        a = HEAP32U[(A + i) >> 2] | 0;
        b = HEAP32U[(B + i) >> 2] | 0;
        // Lower bits
        t = ((a & 0xffff) + (b & 0xffff) + c) | 0;
        // Upper bits
        r = (a >>> 16) + (b >>> 16) + (t >>> 16) | 0;
        // Save
        HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
        // Carry
        c = r >>> 16;
    }
    for (; (i | 0) < (Al | 0) ; i = i + 4 | 0) {
        // Load
        a = HEAP32U[(A + i) >> 2] | 0;
        // Lower bits
        t = ((a & 0xffff) + c) | 0;
        // Upper bits
        r = (a >>> 16) + (t >>> 16) | 0;
        // Save
        HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
        // Carry
        c = r >>> 16;
    }
    // Add resulting carry or adjust R length
    if (c | 0) {
        HEAP32U[(R + i) >> 2] = c | 0;
    } else {
        Rl = Rl - 4 | 0;
    }

    // Move result to point back to the right place
    R = R - 4 | 0;
    // Save the R length
    HEAP32U[R >> 2] = Rl;

    return R | 0;
}


/**
 * Performs a substraction
 */
function intsub(A, B) {
    // Locations of numbers
    A = A | 0;
    B = B | 0;
    var R = 0;
    // Length of numbers
    var Al = 0;
    var Bl = 0;
    var Rl = 0;

    var t = 0;      // Temporary
    var i = 0;      // Index
    var c = 0;      // Carry
    var a = 0;      // A piece of A
    var b = 0;      // A piece of B
    var r = 0;      // A piece of R

    // Read the lenghts of the numbers
    Al = HEAP32U[A >> 2];
    Bl = HEAP32U[B >> 2];

    // Reserve memory for the R
    Rl = (Al | 0) > (Bl | 0) ? Al + 4 | 0 : Bl | 0;
    R = alloc(Rl + 4 | 0) | 0;

    // Move pointers to point to the start of the data
    A = A + 4 | 0;
    B = B + 4 | 0;
    R = R + 4 | 0;

    if ((Al | 0) < (Bl | 0)) {
        for (; (i | 0) < (Al | 0) ; i = i + 4 | 0) {
            // Load
            a = HEAP32U[(A + i) >> 2] | 0;
            b = HEAP32U[(B + i) >> 2] | 0;
            // Lower bits
            t = ((a & 0xffff) - (b & 0xffff) + c) | 0;
            // Upper bits
            r = ((a >>> 16) - (b >>> 16) | 0) + (t >> 16) | 0;
            // Save
            HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
            // Carry
            c = r >> 16;
        }
        for (; (i | 0) < (Bl | 0) ; i = i + 4 | 0) {
            // Load
            b = HEAP32U[(B + i) >> 2] | 0;
            // Lower bits
            t = (c - (b & 0xffff)) | 0;
            // Upper bits
            r = (t >> 16) - (b >>> 16) | 0;
            // Save
            HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
            // Carry
            c = r >> 16;
        }
    } else {
        for (; (i | 0) < (Bl | 0) ; i = i + 4 | 0) {
            // Load
            a = HEAP32U[(A + i) >> 2] | 0;
            b = HEAP32U[(B + i) >> 2] | 0;
            // Lower bits
            t = ((a & 0xffff) - (b & 0xffff) + c) | 0;
            // Upper bits
            r = (a >>> 16) - (b >>> 16) + (t >> 16) | 0;
            // Save
            HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
            // Carry
            c = r >> 16;
        }
        for (; (i | 0) < (Al | 0) ; i = i + 4 | 0) {
            // Load
            a = HEAP32U[(A + i) >> 2] | 0;
            // Lower bits
            t = ((a & 0xffff) + c) | 0;
            // Upper bits
            r = (a >>> 16) + (t >> 16) | 0;
            // Save
            HEAP32U[(R + i) >> 2] = (t & 0xffff) | (r << 16);
            // Carry
            c = r >> 16;
        }
    }
    // Add resulting carry or adjust R length
    for (; (i | 0) < (Rl | 0) ; i = i + 4 | 0) {
        HEAP32U[(R + i) >> 2] = c | 0;
    }

    if ((c | 0)) {
        // c == 0xffffffff
        while (((HEAP32U[(R + i - 4) >> 2] | 0) == (0xffffffff | 0)) & ((HEAP32U[(R + i - 8) >> 2] & 0x80000000) != 0) & ((Rl | 0) > 4)) {
            i = i - 4 | 0;
            Rl = Rl - 4 | 0;
        }
    } else {
        // c == 0x00000000
        while ((HEAP32U[(R + i - 4) >> 2] == 0) & ((Rl | 0) > 4)) {
            i = i - 4 | 0;
            Rl = Rl - 4 | 0;
        }
    }

    // Move result to point back to the right place
    R = R - 4 | 0;
    // Save the R length
    HEAP32U[R >> 2] = Rl;

    return R | 0;
}

/**
 * Parforms a simple and slow multiplication.
 */
function intmul(A, B) {
    // Locations of numbers
    A = A | 0;
    B = B | 0;
    var R = 0;
    // Length of numbers
    var Al = 0;
    var Bl = 0;
    var Rl = 0;
    // Info about negativity
    var An = 0;
    var Bn = 0;
    var c = 0;      // Carry
    var i = 0;      // Index 1
    var j = 0;      // Index 2
    var a = 0;      // A piece of A
    var b = 0;      // A piece of B
    var rh = 0      // A piece of R
    var t = 0;      // Temporary

    // Read the lenghts of the numbers
    Al = HEAP32U[A >> 2];
    Bl = HEAP32U[B >> 2];

    // Find if numbers are negative
    An = (HEAP32U[(A + Al) >> 2] & 0x80000000) != 0;
    Bn = (HEAP32U[(B + Bl) >> 2] & 0x80000000) != 0;

    // Reserve size for the result
    Rl = Al + Bl | 0;
    R = alloc(Rl + 4 | 0) | 0;

    // Move pointers to point to the start of the data
    A = A + 4 | 0;
    B = B + 4 | 0;
    R = R + 4 | 0;

    for (; (i | 0) < (Bl << 1) ; i = i + 2 | 0) {
        c = 0;
        b = (i | 0) < (Bl | 0) ? HEAP32U[(B + i) >> 2] : (Bn ? 0xffffffff : 0);
        if ((i & 2) == 0)
            b = b & 0xffff;
        else
            b = b >>> 16;

        for (j = 0; (j | 0) < (Al << 1) ; j = j + 2 | 0) {
            if ((i + j | 0) >= (Rl | 0)) continue;
            a = (j | 0) < (Al | 0) ? HEAP32U[(A + j) >> 2] : (An ? 0xffffffff : 0);

            if ((j & 2) == 0)
                a = a & 0xffff;
            else
                a = a >>> 16;

            r = (imul(a | 0, b | 0) | 0) + c | 0;

            HEAP16U[(R + i + j) >> 1] += r & 0xffff;
            c = r >>> 16;
        }
    }

    // Restore R
    R = R - 4 | 0;
    // Remove heading zeros
    while (((HEAP32U[(R + Rl) >> 2] == 0) & ((Rl | 0) > 4)))
        Rl = Rl - 4 | 0;
    while (((HEAP32U[(R + Rl) >> 2] | 0) == (0xffffffff | 0)) & ((HEAP32U[(R + Rl - 4) >> 2] & 0x80000000) != 0) & ((Rl | 0) > 4))
        Rl = Rl - 4 | 0;

    // Save the R length
    HEAP32U[R >> 2] = Rl;

    return R;
}

/**
 * Performs a simple division
 */
function div(A, B) {
    // Locations of numbers
    A = A | 0;
    B = B | 0;
    var R = 0;
    // Length of numbers
    var Al = 0;
    var Bl = 0;
    var Rl = 0;

}
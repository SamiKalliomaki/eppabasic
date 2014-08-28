`InStr`
==========

Funktio `InStr(x, y)` palauttaa ensimmäisen kohdan,
jossa merkkijono `y` esiintyy merkkijonossa `x`.
Jos tällaista kohtaa ei ole, funktio palauttaa 0.

Funktio `InStr(k, x, y)` palauttaa vastaavasti
ensimmäisen kohdan kohdasta `k` alkaen.

Esimerkki 1
----------

    Print InStr("aybabtu", "bab")
    Print InStr("aybabtu", "lol")
    
Koodin tulostus:

    3
    0
    
Esimerkki 2
----------

    Print InStr("aybabtu", "b")
    Print InStr(4, "aybabtu", "b")
    Print InStr(7, "aybabtu", "b")
    
Koodin tulostus:

    3
    5
    0
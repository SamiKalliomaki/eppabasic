`Instr`
==========

Funktio `Instr` etsii ensimmäisen kohdan merkkijonossa,
jossa toinen merkkijono esiintyy.
Jos tällaista kohtaa ei ole, funktio palauttaa 0.

Funktiolle voi antaa myös ylimääräisen parametrin,
joka tarkoittaa kohtaa, josta etsintä alkaa.

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
    Print InStr("aybabtu", "b", 4)
    Print InStr("aybabtu", "b", 7)
    
Koodin tulostus:

    3
    5
    0
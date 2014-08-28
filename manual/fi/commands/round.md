`Round`
==========

Funktio `Round(x)` pyöristää luvun `x` kokonaisluvuksi. Jos desimaaliosa on alle 0.5, funktio pyöristää alaspäin, ja muuten funktio pyöristää ylöspäin.

Funktio `Round(x, k)` pyöristää luvun `x` tarkkuudelle `k`. Jos `k` on positiivinen, se tarkoittaa desimaalien määrää nollan jälkeen. Jos `k` on negatiivinen, se tarkoittaa nollien määrää luvun lopussa.

Esimerkki 1
----------

    Print Round(4.48)
    Print Round(4.49)
    Print Round(4.50)
    Print Round(4.51)
    Print Round(4.52)
    
Koodin tulostus:

    4
    4
    5
    5
    5

Esimerkki 2
----------

    Dim pii = 3.141592654
    Print Round(pii, 1)
    Print Round(pii, 2)
    Print Round(pii, 3)
    Print Round(pii, 4)
    Print Round(pii, 5)
    
Koodin tulostus:

    3.1
    3.14
    3.142
    3.1416
    3.14159    
    
Esimerkki 3
----------

    Print Round(12345, -1)
    Print Round(12345, -2)
    Print Round(12345, -3)
    Print Round(12345, -4)
    Print Round(12345, -5)
    
Koodin tulostus:

    12350
    12300
    12000
    10000
    0
    
Katso myös: [`Ceil`](manual:ceil), [`Floor`](manual:floor)
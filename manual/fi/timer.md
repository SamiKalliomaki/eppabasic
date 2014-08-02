`Timer`
==========

Funktio `Timer` palauttaa 1.1.1970 0:00:00 jälkeen kuluneen ajan sekunteina desimaalilukuna.

Esimerkki
----------

Seuraava koodi mittaa, kauanko aikaa käyttäjällä kului painaa välilyöntiä:

    Print "Paina välilyöntiä"
    Dim alku = Timer()
    Do Until KeyHit(32)
        DrawScreen
    Loop
    Print Timer() - alku

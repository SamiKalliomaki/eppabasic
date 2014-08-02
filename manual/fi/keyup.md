`KeyUp`
==========

Funktio `KeyUp` palauttaa tiedon, onko näppäin ylhäällä. 

[`Lista näppäinkoodeista`](manual:keycodes)

Esimerkki
----------

    Do
        ClearScreen
        If KeyUp(32) Then
            Print "et paina välilyöntiä"
        End If
        DrawScreen
    Loop
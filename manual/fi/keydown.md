`KeyDown`
==========

Funktio `KeyDown` palauttaa tiedon, onko näppäin alhaalla. 

[`Lista näppäinkoodeista`](manual:keycodes)

Esimerkki
----------

    Do
        ClearScreen
        If KeyDown(32) Then
            Print "painat välilyöntiä"
        End If
        DrawScreen
    Loop
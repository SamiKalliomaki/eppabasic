`KeyDown`
==========

Funktio `KeyDown` palauttaa tiedon, onko näppäin alhaalla. 

Funktion parametrina on näppäimen koodi.

Esimerkki
----------

    Do
        ClearScreen
        If KeyDown(32) Then
            Print "painat välilyöntiä"
        End If
        DrawScreen
    Loop
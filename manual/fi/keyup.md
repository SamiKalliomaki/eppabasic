`KeyUp`
==========

Funktio `KeyUp` palauttaa tiedon, onko näppäin ylhäällä. 

Funktion parametrina on näppäimen koodi.

Esimerkki
----------

    Do
        ClearScreen
        If KeyUp(32) Then
            Print "et paina välilyöntiä"
        End If
        DrawScreen
    Loop
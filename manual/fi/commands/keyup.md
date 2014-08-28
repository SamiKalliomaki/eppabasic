`KeyUp`
==========

Funktio `KeyUp(x)` palauttaa tiedon, onko näppäin `x` ylhäällä. 

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
    
Katso myös: [`KeyDown`](manual:keydown), [`KeyHit`](manual:keyhit)